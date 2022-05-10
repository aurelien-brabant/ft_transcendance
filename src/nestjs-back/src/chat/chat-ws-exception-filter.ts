import { ArgumentsHost, BadRequestException, Catch } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";

/**
 * Filter to transform Bad Request Exceptions (which is a child class of HttpException)
 * into a Websocket Exception for the Chat Gateway
 */

@Catch(BadRequestException)
export class BadRequestTransformationFilter extends BaseWsExceptionFilter {

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const err = new WsException(exception.getResponse());

    super.catch(err, host);
  }
}
