"use client";

import { useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useDesignStore } from "@/lib/store";
import { toast } from "sonner";

export function useSupabaseAuth() {
  const setUser = useDesignStore((state) => state.setUser);

  const handleUserLogin = useCallback(
    async (authUser: User) => {
      const email = authUser.email;
      const name = authUser.user_metadata?.full_name || email;
      // 1. Trích xuất avatar từ metadata của Google
      const googleAvatar =
        authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture;

      // Save to Zustand store
      setUser({
        id: authUser.id,
        email: email || "",
        name: name || "",
        avatar_url: googleAvatar,
      });

      // Check if user exists in custom 'users' table
      try {
        // Schema uses user_id as PK, and email as unique field
        const { data: existingUser } = await supabase
          .from("users")
          .select("user_id, avatar_url")
          .eq("email", email || "")
          .single();

        const defaultRoleId = "3";

        // Determine if we should update the avatar
        // Mẹo nhỏ: Nếu user tự thay ảnh avatar (upload) của họ 1 lần, thì sau đó không tự update ảnh của gg nữa.
        // Dấu hiệu: Nếu avatar_url đã tồn tại và KHÔNG chứa URL của Google.
        const hasCustomAvatar =
          existingUser?.avatar_url &&
          !existingUser.avatar_url.includes("googleusercontent.com");

        const avatarToSave = hasCustomAvatar
          ? existingUser.avatar_url
          : googleAvatar;

        // 2. Đồng bộ vào bảng users của mình bằng upsert (Update if exists, Insert if not)
        const { error: userError } = await supabase.from("users").upsert({
          user_id: authUser.id,
          full_name: name,
          email: email,
          password_hash: null,
          phone: authUser.phone || null,
          role_id: defaultRoleId,
          avatar_url: avatarToSave, // Lưu link ảnh vào đây
          is_active: true,
          updated_at: new Date().toISOString(),
        });

        if (userError) throw userError;

        if (!existingUser) {
          // Insert into accounts only if new user
          // account_id is NOT NULL character varying
          const { error: accountError } = await supabase
            .from("accounts")
            .insert({
              account_id: `acc_${authUser.id}`,
              user_id: authUser.id,
              provider: "google",
              provider_account_id: authUser.id,
            });

          if (accountError) throw accountError;
        }
      } catch (error) {
        console.error(
          "Error syncing user to database:",
          JSON.stringify(error, null, 2),
        );
        console.dir(error);
      }
    },
    [setUser],
  );

  useEffect(() => {
    // Sync current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleUserLogin(session.user);
      }
    });

    // Listen to auth changes (e.g. after OAuth redirect)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await handleUserLogin(session.user);
        toast.success("Đăng nhập thành công!");
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, handleUserLogin]);
}
