import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertLinkSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Link management routes
  app.post("/api/links", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const validatedData = insertLinkSchema.parse(req.body);
    const link = await storage.createLink({
      ...validatedData,
      userId: req.user!.id,
    });
    res.status(201).json(link);
  });

  app.get("/api/links", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const links = await storage.getUserLinks(req.user!.id);
    res.json(links);
  });

  app.get("/api/links/public", async (req, res) => {
    const users = await storage.getAllUsers();
    const publicLinks = [];
    for (const user of users) {
      const links = await storage.getUserLinks(user.id);
      publicLinks.push(...links
        .filter(link => link.isPublished)
        .map(link => ({...link, username: user.username}))
      );
    }

    res.json(publicLinks);
  });

  app.get("/api/links/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(404);
    const link = await storage.getLink(parseInt(req.params.id));
    if (!link || link.userId !== req.user!.id) return res.sendStatus(404);
    res.json(link);
  });

  app.patch("/api/links/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const link = await storage.getLink(parseInt(req.params.id));
    if (!link || link.userId !== req.user!.id) return res.sendStatus(404);

    const validatedData = insertLinkSchema.partial().parse(req.body);
    const updatedLink = await storage.updateLink(link.id, validatedData);
    res.json(updatedLink);
  });

  app.delete("/api/links/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const link = await storage.getLink(parseInt(req.params.id));
    if (!link || link.userId !== req.user!.id) return res.sendStatus(404);
    await storage.deleteLink(link.id);
    res.sendStatus(204);
  });

  // Analytics routes
  app.get("/api/links/:id/analytics", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const link = await storage.getLink(parseInt(req.params.id));
    if (!link || link.userId !== req.user!.id) return res.sendStatus(404);
    const clicks = await storage.getLinkClicks(link.id);

    // Group clicks by day for the chart
    const analytics = clicks.reduce((acc: any[], click) => {
      const date = new Date(click.clickedAt).toLocaleDateString();
      const existingDay = acc.find(day => day.clickedAt === date);
      if (existingDay) {
        existingDay.count++;
      } else {
        acc.push({ clickedAt: date, count: 1 });
      }
      return acc;
    }, []);

    res.json(analytics);
  });

  // Add this new endpoint for search
  app.get("/api/search", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const searchType = req.query.searchType as string;
    const query = req.query.q as string;

    if (!query) return res.json([]);

    if (searchType === "links") {
      const links = await storage.getAllLinks();
      const filteredLinks = links.filter(link =>
        link.title?.toLowerCase().includes(query.toLowerCase()) ||
        link.originalUrl.toLowerCase().includes(query.toLowerCase()) ||
        link.shortCode.toLowerCase().includes(query.toLowerCase())
      );
      res.json(filteredLinks);
    } else if (searchType === "users") {
      const users = await storage.getAllUsers();
      const searchResults = await Promise.all(
        users
          .filter(user => user.username.toLowerCase().includes(query.toLowerCase()))
          .map(async user => ({
            ...user,
            totalLinks: (await storage.getUserLinks(user.id)).length
          }))
      );
      res.json(searchResults);
    }
  });

  // Add this new endpoint after the search endpoint
  app.get("/api/search/recommendations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const searchType = req.query.searchType as string;
    const query = req.query.q as string;

    if (!query) return res.json([]);

    let recommendations: string[] = [];

    if (searchType === "links") {
      const links = await storage.getAllLinks();
      const domains = new Set(links.map(link => {
        try {
          return new URL(link.originalUrl).hostname;
        } catch {
          return null;
        }
      }).filter((domain): domain is string => domain !== null));

      recommendations = Array.from(domains)
        .filter(domain => domain.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
    } else if (searchType === "users") {
      const users = await storage.getAllUsers();
      recommendations = users
        .map(user => user.username)
        .filter(username => username.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
    }

    res.json(recommendations);
  });

  app.patch("/api/user/preferences", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const updatedUser = await storage.updateUserPreferences(req.user!.id, req.body);
    res.json(updatedUser);
  });

  app.get("/api/leaderboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const users = await storage.getAllUsers();
    const userLinks = await Promise.all(
      users.map(async (user) => ({
        username: user.username,
        links: await storage.getUserLinks(user.id),
      }))
    );

    const leaderboard = await Promise.all(
      userLinks.map(async ({ username, links }) => {
        const clickCounts = await Promise.all(
          links.map(link => storage.getLinkClicks(link.id))
        );
        const totalClicks = clickCounts.reduce((acc, clicks) => acc + clicks.length, 0);
        return { username, totalClicks };
      })
    );

    const sortedLeaderboard = leaderboard
      .sort((a, b) => b.totalClicks - a.totalClicks)
      .slice(0, 10);

    res.json(sortedLeaderboard);
  });

  // Redirect routes
  app.get("/s/:shortCode", async (req, res) => {
    const link = await storage.getLinkByShortCode(req.params.shortCode);
    if (!link || !link.isPublished) return res.sendStatus(404);

    if (link.password && req.query.password !== link.password) {
      return res.status(401).send("Password required");
    }

    await storage.createClick({
      linkId: link.id,
      userAgent: req.headers["user-agent"] || "",
      ipAddress: req.ip,
    });

    const targetUrl = link.customDomain || link.originalUrl;
    res.redirect(targetUrl);
  });

  const httpServer = createServer(app);
  return httpServer;
}