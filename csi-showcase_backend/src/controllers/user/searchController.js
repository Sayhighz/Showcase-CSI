// controllers/user/searchController.js
import logger from '../../config/logger.js';
import { successResponse, handleServerError } from '../../utils/responseFormatter.js';
import { getPaginationParams } from '../../constants/pagination.js';
import { STATUS_CODES } from '../../constants/statusCodes.js';
import { isEmpty } from '../../utils/validationHelper.js';
import searchService from '../../services/searchService.js';
import { asyncHandler } from '../../middleware/loggerMiddleware.js';

export const searchProjects = asyncHandler(async (req, res) => {
  const keyword = typeof req.query.keyword === 'object' ? (req.query.keyword.keyword || '') : (req.query.keyword || '');
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const filters = {
    type: req.query.type || null,
    year: req.query.year ? parseInt(req.query.year, 10) : null,
    studyYear: req.query.studyYear ? parseInt(req.query.studyYear, 10) : null,
  };

  try {
    const result = await searchService.searchProjects(keyword, filters, { page, limit });
    return res.status(STATUS_CODES.OK).json(successResponse(
      result,
      keyword ? `Search results for "${keyword}"` : 'All projects retrieved successfully'
    ));
  } catch (error) {
    logger.error('Error in searchProjects controller:', error);
    return handleServerError(res, error);
  }
});

export const searchStudents = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword || '';
  const limit = parseInt(req.query.limit) || 10;

  if (isEmpty(keyword)) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      statusCode: STATUS_CODES.BAD_REQUEST,
      message: 'Please provide a search keyword'
    });
  }

  try {
    const students = await searchService.searchStudents(keyword, limit);
    return res.status(STATUS_CODES.OK).json(successResponse(
      students,
      `Found ${students.length} students matching "${keyword}"`
    ));
  } catch (error) {
    logger.error('Error in searchStudents controller:', error);
    return handleServerError(res, error);
  }
});


export default {
  searchProjects,
  searchStudents,
};
