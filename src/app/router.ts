/**
 * POLARIS CLIENT-SIDE ROUTER
 * Client-side SPA routing with pattern matching, URL location sync, history API support, query params, and 404 handler.
 */

export type RouteHandler = (params?: Record<string, string>, queryParams?: Record<string, string>) => HTMLElement;

interface PatternRoute {
  pattern: string;
  keys: string[];
  regex: RegExp;
  handler: RouteHandler;
}

export class Router {
  private exactRoutes: Map<string, RouteHandler> = new Map();
  private patternRoutes: PatternRoute[] = [];
  private fallbackHandler?: RouteHandler;
  private onRouteChanged?: (path: string, content: HTMLElement, queryParams?: Record<string, string>) => void;

  constructor() {
    window.addEventListener('popstate', () => {
      this.handleCurrentUrl();
    });
  }

  public addRoute(path: string, handler: RouteHandler): void {
    if (path.includes(':')) {
      const keys: string[] = [];
      const regexPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
        keys.push(key);
        return '([^/]+)';
      });
      const regex = new RegExp(`^${regexPath}/?$`);
      this.patternRoutes.push({ pattern: path, keys, regex, handler });
    } else {
      this.exactRoutes.set(path, handler);
    }
  }

  public setNotFoundHandler(handler: RouteHandler): void {
    this.fallbackHandler = handler;
  }

  public navigate(pathWithQuery: string, pushState: boolean = true): void {
    // Normalize path query
    const url = new URL(pathWithQuery, window.location.origin);
    const path = url.pathname;

    if (pushState && window.location.pathname + window.location.search !== pathWithQuery) {
      window.history.pushState({}, '', pathWithQuery);
    }

    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    // 1. Try exact route match
    const exactHandler = this.exactRoutes.get(path);
    if (exactHandler) {
      const element = exactHandler({}, queryParams);
      if (this.onRouteChanged) {
        this.onRouteChanged(path, element, queryParams);
      }
      return;
    }

    // 2. Try pattern routes
    for (const route of this.patternRoutes) {
      const match = path.match(route.regex);
      if (match) {
        const params: Record<string, string> = {};
        route.keys.forEach((key, index) => {
          const val = match[index + 1];
          if (val !== undefined) {
            params[key] = val;
          }
        });
        const element = route.handler(params, queryParams);
        if (this.onRouteChanged) {
          this.onRouteChanged(path, element, queryParams);
        }
        return;
      }
    }

    // 3. Fallback 404
    if (this.fallbackHandler) {
      const element = this.fallbackHandler({}, queryParams);
      if (this.onRouteChanged) {
        this.onRouteChanged('/404', element, queryParams);
      }
    }
  }

  public handleCurrentUrl(): void {
    const currentPath = window.location.pathname + window.location.search;
    this.navigate(currentPath, false);
  }

  public onRoute(callback: (path: string, content: HTMLElement, queryParams?: Record<string, string>) => void): void {
    this.onRouteChanged = callback;
  }
}
