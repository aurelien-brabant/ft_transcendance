import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	getParam(get: string): { get: string } {
		return {
			get: `${get}`
	  };
	}

	postParam(post: string, data: string): { post: string, data: { } } {
		return {
			post: `${post}`,
			data: `${data}`
	  };
	}
}
