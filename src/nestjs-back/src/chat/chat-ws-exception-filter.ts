import { ArgumentsHost, BadRequestException, Catch } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";

@Catch(BadRequestException)
export class BadRequestTransformationFilter extends BaseWsExceptionFilter {

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const err = new WsException(exception.getResponse());

    super.catch(err, host);
  }
}
