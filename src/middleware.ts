import { authMiddleware } from "better-auth/next-js";

export default authMiddleware({
    customRedirect: async (session, request) => {
        const url = new URL(request.url);
        
        // Se estiver logado e tentar acessar /login, manda pro dashboard
        if (session && url.pathname === "/login") {
            return Response.redirect(new URL("/dashboard", request.url));
        }
        
        // Se NÃO estiver logado e tentar acessar dashboard, manda pro login (default behavior usually)
        if (!session && url.pathname.startsWith("/dashboard")) {
            return Response.redirect(new URL("/login", request.url));
        }

        return;
    }
});

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};
