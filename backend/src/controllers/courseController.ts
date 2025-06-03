import { Request, Response, NextFunction } from "express";
import { Course } from "../models/Course";
import { AppError } from "../middleware/errorHandler";

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Instructor
export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.create({
      ...req.body,
      instructor: req.user._id,
    });

    res.status(201).json(course);
  } catch (error: any) {
    next(new AppError(error.message, 400));
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query = Course.find()
      .populate("instructor", "firstName lastName email")
      .skip(skip)
      .limit(limit)
      .sort("-createdAt");

    const [courses, total] = await Promise.all([
      query.exec(),
      Course.countDocuments(),
    ]);

    res.json({
      courses,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error: any) {
    next(new AppError(error.message, 400));
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "firstName lastName email")
      .populate("reviews.user", "firstName lastName");

    if (!course) {
      next(new AppError("Course not found", 404));
      return;
    }

    res.json(course);
  } catch (error: any) {
    next(new AppError(error.message, 400));
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      next(new AppError("Course not found", 404));
      return;
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      next(new AppError("Not authorized to update this course", 403));
      return;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedCourse);
  } catch (error: any) {
    next(new AppError(error.message, 400));
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor
export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      next(new AppError("Course not found", 404));
      return;
    }

    // Check if user is the instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      next(new AppError("Not authorized to delete this course", 403));
      return;
    }

    await course.deleteOne();
    res.json({ message: "Course removed" });
  } catch (error: any) {
    next(new AppError(error.message, 400));
  }
};

// @desc    Add review to course
// @route   POST /api/courses/:id/reviews
// @access  Private
export const addCourseReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { rating, comment } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      next(new AppError("Course not found", 404));
      return;
    }

    // Check if user already reviewed
    const alreadyReviewed = course.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      next(new AppError("Course already reviewed", 400));
      return;
    }

    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment,
    };

    course.reviews.push(review);
    course.rating =
      course.reviews.reduce((acc, item) => item.rating + acc, 0) /
      course.reviews.length;

    await course.save();
    res.status(201).json({ message: "Review added" });
  } catch (error: any) {
    next(new AppError(error.message, 400));
  }
};
