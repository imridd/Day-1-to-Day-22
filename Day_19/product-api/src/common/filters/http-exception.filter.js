
const {
  Catch,
  HttpException,
  HttpStatus
} = require('@nestjs/common');

class HttpExceptionFilter {

  catch(exception, host) {

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    if (exception.code === 'ER_DUP_ENTRY') {

      status = HttpStatus.CONFLICT;
      message = 'Product SKU already exists';

    } else if (exception instanceof HttpException) {

      status = exception.getStatus();

      const errorResponse = exception.getResponse();

      message =
        typeof errorResponse === 'string'
          ? errorResponse
          : errorResponse.message || exception.message;

    } else {

      status = exception.status || exception.statusCode || 500;

      if (status < 500) {
        message = exception.message;
      }

    }

    if (status >= 500) {
      console.error(exception);
    }

    response.status(status).json({
      statusCode: status,
      message
    });

  }

}

Catch()(HttpExceptionFilter);

module.exports = HttpExceptionFilter;
