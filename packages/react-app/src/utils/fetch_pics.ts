/*
 * @Author: Kanata You 
 * @Date: 2022-05-04 17:35:51 
 * @Last Modified by: Kanata You
 * @Last Modified time: 2022-05-05 12:32:24
 */

import axios from 'axios';


/**
 * @see https://unsplash.com/documentation
 */
const PHOTO_API = 'https://api.unsplash.com';
// https://unsplash.com/oauth/applications/325699
const AK = '8BBMUaRBABBdM7EttI1UoLlUwZl-e3lVeytY0coAmoE';

/**
 * @see https://unsplash.com/documentation#link-relations-1
 */
export interface PhotoData {
  id: string;
  categories: [];
  color: string;
  description: null;
  alt_description: null;
  width: number;
  height: number;
  likes: number;
  links: {
    self: string;
    html: string;
    download: string;
    download_location: string;
  };
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
}

let randomPhotoPageCursor = 1;

/**
 * 获取随机图片.
 *
 * @param {number} [num=10] 数量
 * @param {string[]} [keywords=['travel', 'scene']] 关键词
 * @returns {Promise<string[]>} 图片 url 列表
 */
const fetchPics = async (
  num: number = 10,
  keywords: string[] = ['travel', 'scene'],
): Promise<string[]> => {
  const res = await axios.get<PhotoData[]>(
    `${PHOTO_API}/photos?page=${
      randomPhotoPageCursor++
    }&per_page=${num}&client_id=${AK}&order_by=popular`
  );

  const photos = res.data.map(d => d.urls.regular);
  
  return photos;
};


export default fetchPics;
