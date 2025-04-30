import "vue-router";

declare module "vue-router" {
    interface RouteMeta {
        // requiresAuth?: boolean; // if true, route will only be navigated if user is authenticated.
        sessionType?: UserSessionType; // route shows based on sessionType
        isHeaderLink?: boolean; // shows at the header
        hideHeader?: boolean;
        title?: string;
        transparentHeader?: boolean;
    }
}

export declare type UserSessionType = "anonymous" | "loggedIn" | "all";
