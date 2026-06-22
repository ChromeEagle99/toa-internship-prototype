import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "toa-project";

export function ProductsMenu() {
  return (
    <NavigationMenu defaultValue="products">
      <NavigationMenuList>
        <NavigationMenuItem value="products">
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 12,
                width: 300,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <li>
                <NavigationMenuLink
                  href="#"
                  className="block rounded-md p-3 hover:bg-bg-muted"
                >
                  <div style={{ fontWeight: 500 }} className="text-fg">
                    Analytics
                  </div>
                  <div style={{ fontSize: 13 }} className="text-fg-muted">
                    Dashboards and reporting for your whole team
                  </div>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink
                  href="#"
                  className="block rounded-md p-3 hover:bg-bg-muted"
                >
                  <div style={{ fontWeight: 500 }} className="text-fg">
                    Automation
                  </div>
                  <div style={{ fontSize: 13 }} className="text-fg-muted">
                    Connect workflows without writing code
                  </div>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value="pricing">
          <NavigationMenuTrigger>Pricing</NavigationMenuTrigger>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export function ResourcesMenu() {
  return (
    <NavigationMenu defaultValue="resources">
      <NavigationMenuList>
        <NavigationMenuItem value="resources">
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 12,
                width: 260,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <li>
                <NavigationMenuLink
                  href="#"
                  className="block rounded-md p-3 hover:bg-bg-muted text-fg"
                >
                  Documentation
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink
                  href="#"
                  className="block rounded-md p-3 hover:bg-bg-muted text-fg"
                >
                  Guides &amp; tutorials
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink
                  href="#"
                  className="block rounded-md p-3 hover:bg-bg-muted text-fg"
                >
                  Community forum
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
