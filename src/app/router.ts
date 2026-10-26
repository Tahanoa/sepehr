/**
 * POLARIS CLIENT-SIDE ROUTER
 * Client-side SPA routing with URL location sync, history API support, query params, and 404 handler.
 */

export type RouteHandler = (params?: Record<string, string>, queryParams?: Record<string, string>) => HTMLElement;

export class Router {
  private routes: Map<string, RouteHandler> = new Map();
  private fallbackHandler?: RouteHandler;
  private onRouteChanged?: (path: string, content: HTMLElement, queryParams?: Record<string, string>) => void;

  constructor() {
    window.addEventListener('popstate', () => {
      this.handleCurrentUrl();
    });
  }

  public addRoute(path: string, handler: RouteHandler): void {
    this.routes.set(path, handler);
  }

  public setNotFoundHandler(handler: RouteHandler): void {
    this.fallbackHandler = handler;
  }

  public navigate(pathWithQuery: string, pushState: boolean = true): void {
    const url = new URL(pathWithQuery, window.location.origin);
    const path = url.pathname;

    if (pushState && window.location.pathname + window.location.search !== pathWithQuery) {
      window.history.pushState({}, '', pathWithQuery);
    }

    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const handler = this.routes.get(path);
    if (handler) {
      const element = handler({}, queryParams);
      if (this.onRouteChanged) {
        this.onRouteChanged(path, element, queryParams);
      }
    } else if (this.fallbackHandler) {
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
