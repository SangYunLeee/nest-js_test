import { SERVE_PATH, TEMP_FOLDER_PATH } from './serve-file.const';
import * as multer from 'multer';

export const multerOption = {
  // file size limit 5MB
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다.'), false);
    }
  },
  storage: multer.diskStorage({
    destination: (() => {
      return TEMP_FOLDER_PATH;
    })(),
    filename: (req, file, cb) => {
      const now = new Date(Date.now());
      const year = now.getFullYear().toString().slice(2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0'); // 일
      const hours = now.getHours().toString().padStart(2, '0'); // 시
      const minutes = now.getMinutes().toString().padStart(2, '0'); // 분
      const seconds = now.getSeconds().toString().padStart(2, '0'); // 초
      const formattedDate = `${year}${month}${day}${hours}${minutes}${seconds}`;
      cb(
        null,
        `${formattedDate}__userId_${req.user.id}__filename_${file.originalname}`,
      );
    },
  }),
};
