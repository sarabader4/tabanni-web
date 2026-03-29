import { Router, type IRouter } from "express";
import healthRouter from "./health";
import petsRouter from "./pets";
import adoptionRequestsRouter from "./adoptionRequests";
import fosterRequestsRouter from "./fosterRequests";
import donationsRouter from "./donations";
import galleryRouter from "./gallery";
import lostFoundRouter from "./lostFound";
import messagesRouter from "./messages";
import usersRouter from "./users";
import adminRouter from "./admin";
import aiRouter from "./ai";
import paymentsRouter from "./payments";
import authRouter from "./auth";
import onboardingRouter from "./onboarding";
import volunteerApplicationsRouter from "./volunteerApplications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(petsRouter);
router.use(adoptionRequestsRouter);
router.use(fosterRequestsRouter);
router.use(donationsRouter);
router.use(galleryRouter);
router.use(lostFoundRouter);
router.use(messagesRouter);
router.use(usersRouter);
router.use(adminRouter);
router.use(aiRouter);
router.use(paymentsRouter);
router.use(onboardingRouter);
router.use(volunteerApplicationsRouter);

export default router;
