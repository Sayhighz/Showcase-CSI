// controllers/user/searchController.js
const logger = require('../../config/logger.js');
const { successResponse, handleServerError } = require('../../utils/responseFormatter.js');
const { getPaginationParams } = require('../../constants/pagination.js');
const { STATUS_CODES } = require('../../constants/statusCodes.js');
const { isEmpty } = require('../../utils/validationHelper.js');
const searchService = require('../../services/searchService.js');
const { asyncHandler } = require('../../middleware/loggerMiddleware.js');

const searchProjects = asyncHandler(async (req, res) => {
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

const searchStudents = asyncHandler(async (req, res) => {
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

// Export functions
module.exports = {
  searchProjects,
  searchStudents
};