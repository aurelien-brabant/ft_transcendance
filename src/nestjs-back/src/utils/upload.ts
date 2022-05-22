import { NotAcceptableException } from "@nestjs/common";
import { extname } from "path";

export const imageFileFilter = (req, file, callback) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
    return callback(new NotAcceptableException('Only image files are allowed!'), false);
  } else if ((file.originalname.split('.').length > 2)  && file.originalname.includes('%')) {
    return callback(new NotAcceptableException('Percent character not allowed in filename.'), false);
  }
  callback(null, true); 
};

export const editFileName = (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    const randomName = Array(8)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    callback(null, `${name}-${randomName}${fileExtName}`);
};