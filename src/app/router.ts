/**
 * POLARIS ROUTER
 * Simple, lightweight view router.
 */

export type RouteHandler = (params?: Record<string, string>) => HTMLElement;

export class Router {
  private routes: Map<string, RouteHandler> = new Map();
  private onRouteChanged?: (path: string, content: HTMLElement) => void;

  public addRoute(path: string, handler: RouteHandler): void {
    this.routes.set(path, handler);
  }

  public navigate(path: string): void {
    const handler = this.routes.get(path) || this.routes.get('/');
    if (handler && this.onRouteChanged) {
      const element = handler();
      this.onRouteChanged(path, element);
    }
  }

  public onRoute(callback: (path: string, content: HTMLElement) => void): void {
    this.onRouteChanged = callback;
  }
}
