export type MarketingNavHref =
  | "/"
  | "/customize"
  | "/shop"
  | "/cart"
  | "/about"
  | "/login"
  | "/signup"
  | "/wishlist"
  | "/account"
  | "/checkout";

export interface NavItem {
  href: MarketingNavHref;
  label: string;
}
