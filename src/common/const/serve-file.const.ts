import { join } from 'path';

export const SERVE_PATH = process.cwd();
export const PUBLIC_FOLDER_NAME = 'public';
export const TEMP_FOLDER_NAME = 'temp';
export const POSTS_FOLDER_NAME = 'posts';
export const PUBLIC_FOLDER_PATH = join(SERVE_PATH, PUBLIC_FOLDER_NAME);
export const TEMP_FOLDER_PATH = join(PUBLIC_FOLDER_PATH, TEMP_FOLDER_NAME);
export const POSTS_FOLDER_PATH = join(PUBLIC_FOLDER_PATH, POSTS_FOLDER_NAME);
