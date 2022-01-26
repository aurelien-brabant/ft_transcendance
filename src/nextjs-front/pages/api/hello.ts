// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  name: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  
  const code: string = req.body.code;
  console.log(code);
	const {spawn} = require('child_process');
//	const child = spawn('curl -F grant_type=authorization_code -F client_id=3abe804af24b93683af50cc13f370833e49b97d8431026f7333497922021abf0 -F client_secret=f90c0a91ba638e2223192c3ab3b3278d2cf53ef313130e70c531690dff8a0e50 -F code=f03f9b7a3defba649ebd14818bb52788f647c644b3647ebbf3c8e0a02403a9d7 -F redirect_uri=http://localhost:3000/ -X POST https://api.intra.42.fr/oauth/token');
  const child = spawn('python3', ['scripts/getToken.py', code]);
  let cmd: string;
  
  
  child.stdout.on('data', function (data: string) {
	  cmd = data.toString();
		console.log(cmd);
	});

	child.stderr.on('data', (data: string) => {
  		console.error(`stderr: ${data}`);
	});

	child.on('close', (code: string) => {
		console.log(`child process exit with status code ${code}`);
		res.status(200).json({code: code, cmd: cmd});
	});
}
