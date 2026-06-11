
export const userAuthMiddleware = async (req, res, next) => {
    try {
        // 1. ONLY check the Authorization header (Ignore the cookies entirely here)
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({ 
                message: "Unauthorized: No access token provided" 
            });
        }

        
        const accessToken = authHeader.split(' ')[1];
        const decoded = jwt.verify(accessToken, process.env.JWT_ACESS_SECRET);

        // 3. Optional but recommended: Verify the session is still active in Prisma
        // decoded.id and decoded.sessionId come directly from the token payload
        const activeSession = await prisma.session.findUnique({
            where: { id: decoded.sessionId },
            include: { user: true } 
        });

        if (!activeSession) {
            return res.status(401).json({ 
                message: "Unauthorized: Session has been revoked" 
            });
        }
        req.user = {
            id: activeSession.userId,
            sessionId: activeSession.id,
            role: activeSession.user.role
        };
        next(); 
        
    } catch (error) {
        return res.status(401).json({ 
            message: "Unauthorized: Access token invalid or expired" 
        });
    }
};