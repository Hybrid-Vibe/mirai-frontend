"use client";

import { useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useDesignStore } from "@/lib/store";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { toast } from "sonner";
import {
  setAuthToken,
  clearAuthToken,
  userApi,
  refreshAuthSession,
} from "@/lib/api-client";
import { decodeJwt, isJwtExpired } from "@/lib/jwt";

export function useSupabaseAuth() {
  const setUser = useDesignStore((state) => state.setUser);
  const setAuthLoading = useDesignStore((state) => state.setAuthLoading);

  const handleUserLogin = useCallback(
    async (authUser: User) => {
      const email = authUser.email;
      const name = authUser.user_metadata?.full_name || email;
      const googleAvatar =
        authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture;

      // Save to Zustand store
      let nameToUse = name || "";
      if (typeof window !== "undefined") {
        const savedLocal = localStorage.getItem(`mirai_profile_${authUser.id}`);
        if (savedLocal) {
          try {
            const localData = JSON.parse(savedLocal);
            if (localData.fullName) {
              nameToUse = localData.fullName;
            }
          } catch (e) {
            console.error("Failed to parse local profile:", e);
          }
        }
      }

      setUser({
        id: authUser.id,
        email: email || "",
        name: nameToUse,
        avatar_url: googleAvatar,
        role: "3", // default role for users
      });

      // Load user cart and wishlist immediately
      useCartStore.getState().loadUserCart(authUser.id);
      useWishlistStore.getState().loadUserWishlist(authUser.id);
      // Synchronize latest cart from backend asynchronously
      useCartStore.getState().fetchCart(authUser.id);

      // Check if user exists in custom 'users' table
      try {
        // 1. Use maybeSingle() to avoid error if user doesn't exist
        // Query by user_id as it's the primary key
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", authUser.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        // NOTE: We are disabling the manual sync (upsert) here because it triggers
        // an infinite recursion loop (stack depth limit exceeded) in Supabase triggers.
        // The project should rely on a database-side trigger to sync auth.users to public.users.
        /*
        const defaultRoleId = "3";
        const hasCustomAvatar =
          existingUser?.avatar_url &&
          !existingUser.avatar_url.includes("googleusercontent.com");

        const avatarToSave = hasCustomAvatar
          ? existingUser.avatar_url
          : googleAvatar;

        const needsSync =
          !existingUser ||
          existingUser.full_name !== name ||
          existingUser.avatar_url !== avatarToSave ||
          existingUser.email !== email;

        if (needsSync) {
          const { error: userError } = await supabase.from("users").upsert({
            user_id: authUser.id,
            full_name: name,
            email: email,
            password_hash: null,
            phone: authUser.phone || null,
            role_id: defaultRoleId,
            avatar_url: avatarToSave,
            is_active: true,
            updated_at: new Date().toISOString(),
          });

          if (userError) throw userError;
        }
        */

        // 2. Update local state with the most accurate data from DB if available
        if (existingUser) {
          let nameToUse = existingUser.full_name || name || "";
          if (typeof window !== "undefined") {
            const savedLocal = localStorage.getItem(
              `mirai_profile_${existingUser.user_id}`,
            );
            if (savedLocal) {
              try {
                const localData = JSON.parse(savedLocal);
                if (localData.fullName) {
                  nameToUse = localData.fullName;
                }
              } catch (e) {
                console.error("Failed to parse local profile:", e);
              }
            }
          }

          setUser({
            id: existingUser.user_id,
            email: existingUser.email || email || "",
            name: nameToUse,
            avatar_url: existingUser.avatar_url || googleAvatar,
            role: existingUser.role_id || "3",
          });
        }

        if (!existingUser) {
          // If user doesn't exist yet, we still have the auth info in store from top of function
          // We can optionally wait for the trigger or handle it here
          // For now, we skip manual account insertion to avoid recursion
        }
      } catch (error: unknown) {
        const err = error as { code?: string };
        if (
          err?.code === "54001" ||
          err?.code === "57014" ||
          (typeof error === "string" &&
            (error.includes("54001") || error.includes("57014")))
        ) {
          console.warn(
            `Supabase database fetch failed (${err?.code || "timeout/recursion"}). Skipping public.users fetch and relying on auth.users metadata.`,
          );
          return;
        }

        console.error(
          "Error syncing user to database:",
          error instanceof Error
            ? error.message
            : JSON.stringify(error, null, 2),
        );
      }
    },
    [setUser],
  );

  useEffect(() => {
    // Sync current session on mount
    const initializeAuth = async () => {
      setAuthLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user && session.access_token) {
          setAuthToken(session.access_token);
          await handleUserLogin(session.user);
        } else {
          // No Supabase session, check local C# JWT session
          let token = localStorage.getItem("mirai_auth_token");
          if (token) {
            if (isJwtExpired(token)) {
              try {
                const refreshedSession = await refreshAuthSession();
                token =
                  refreshedSession.accessToken || refreshedSession.token || "";
              } catch (refreshError) {
                console.warn(
                  "Failed to refresh backend auth session:",
                  refreshError,
                );
                clearAuthToken();
                setUser(null);
                return;
              }
            }

            if (token) {
              const decoded = decodeJwt(token);
              if (decoded && decoded.sub) {
                setAuthToken(token);
                const profile = await userApi.getUserById(decoded.sub);

                let nameToUse =
                  profile.fullName || decoded.email?.split("@")[0] || "User";
                if (typeof window !== "undefined") {
                  const savedLocal = localStorage.getItem(
                    `mirai_profile_${decoded.sub}`,
                  );
                  if (savedLocal) {
                    try {
                      const localData = JSON.parse(savedLocal);
                      if (localData.fullName) nameToUse = localData.fullName;
                    } catch (e) {
                      console.error("Failed to parse local profile:", e);
                    }
                  }
                }

                setUser({
                  id: decoded.sub,
                  email: profile.email || decoded.email || "",
                  name: nameToUse,
                  role:
                    profile.roleId || profile.roleName || decoded.role || "3",
                });

                // Load user cart and wishlist
                useCartStore.getState().loadUserCart(decoded.sub);
                useWishlistStore.getState().loadUserWishlist(decoded.sub);
                useCartStore.getState().fetchCart(decoded.sub);
              } else {
                clearAuthToken();
                setUser(null);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to rehydrate auth session:", err);
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();

    // Listen to auth changes (e.g. after OAuth redirect)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
        session?.user
      ) {
        setAuthToken(session.access_token);
        await handleUserLogin(session.user);
        if (event === "SIGNED_IN") {
          toast.success("Đăng nhập thành công!");
        }
      } else if (event === "SIGNED_OUT") {
        clearAuthToken();
        setUser(null);
        useCartStore.getState().clearCart();
        useWishlistStore.getState().clearWishlist();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, handleUserLogin, setAuthLoading]);
}
