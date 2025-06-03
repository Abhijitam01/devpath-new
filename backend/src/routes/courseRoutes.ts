import express from "express";
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  addCourseReview,
} from "../controllers/courseController";
import { protect, authorize } from "../middleware/auth";

const router = express.Router();

// Public routes
router.get("/", getCourses);
router.get("/:id", getCourse);

// Protected routes
router.use(protect);

// Instructor routes
router.post("/", authorize("instructor", "admin"), createCourse);
router.put("/:id", authorize("instructor", "admin"), updateCourse);
router.delete("/:id", authorize("instructor", "admin"), deleteCourse);

// Student routes
router.post(
  "/:id/reviews",
  authorize("student", "instructor", "admin"),
  addCourseReview
);

export default router;
