import OpenGraphImage, {
  alt as openGraphAlt,
  contentType as openGraphContentType,
  size as openGraphSize,
} from './opengraph-image';

export const runtime = 'edge';
export const alt = openGraphAlt;
export const size = openGraphSize;
export const contentType = openGraphContentType;
export default OpenGraphImage;
