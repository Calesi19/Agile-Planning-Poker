import "preact-router";

declare module "preact-router" {
  export interface RoutableProps {
    path?: string;
    default?: boolean;
  }
}
