/* eslint-disable jsx-a11y/alt-text */

import { Photo } from '@/photo';
import { NextImageSize } from '@/platforms/next-image';
import { IS_PREVIEW } from '@/app/config';
import { getDataUrlsForPhotos } from '@/photo/storage';

export default async function ImagePhotoGrid({
  photos,
  width,
  widthArbitrary,
  height,
  imagePosition = 'center',
  gap = 0,
  imageStyle,
}: ({
  photos: Photo[]
  height: number
  imagePosition?: 'center' | 'top'
  gap?: number
  imageStyle?: React.CSSProperties
} & (
  { width: NextImageSize, widthArbitrary?: undefined } |
  { width?: undefined, widthArbitrary: number }
))) {

  // 防止 photos 为 undefined/null
  const safePhotos = Array.isArray(photos) ? photos.filter(Boolean) : [];

  let count = safePhotos.length;

  if (count >= 12) count = 12;
  else if (count >= 6) count = 6;
  else if (count >= 4) count = 4;

  const hasSplitLayout = count === 3;

  const nextImageWidth: NextImageSize =
    count <= 2 ? (width ?? 1080) : 640;

  const optimizedSuffix =
    count <= 2 ? 'lg' : 'md';

  let rows = 1;
  if (count > 12) rows = 4;
  else if (count > 6) rows = 3;
  else if (count >= 3) rows = 2;

  const imagesPerRow = Math.max(1, Math.round(count / rows));

  const totalWidth = width ?? widthArbitrary ?? 1080;

  const cellWidth =
    totalWidth / imagesPerRow -
    ((imagesPerRow - 1) * gap) / imagesPerRow;

  const cellHeight =
    height / rows -
    ((rows - 1) * gap) / rows;

  // 获取图片 data url
  const rawPhotoUrls = await getDataUrlsForPhotos(
    safePhotos,
    optimizedSuffix,
    nextImageWidth,
    IS_PREVIEW,
  ).catch(() => []);

  // 🔥 关键修复：过滤 undefined
  const photoUrls = Array.isArray(rawPhotoUrls)
    ? rawPhotoUrls.filter(Boolean)
    : [];

  // 🔥 关键修复：安全渲染函数
  const renderPhoto = (
    photo: typeof photoUrls[number] | undefined,
    width: number,
    height: number,
  ) => {
    if (!photo) return null;

    const { id, urlData } = photo;

    if (!id || !urlData) return null;

    return (
      <div
        key={id}
        style={{
          display: 'flex',
          width,
          height,
          overflow: 'hidden',
          filter: 'saturate(1.1)',
        }}
      >
        <img
          src={urlData}
          style={{
            ...imageStyle,
            width: '100%',
            ...(imagePosition === 'center' && {
              height: '100%',
            }),
            objectFit: 'cover',
          }}
        />
      </div>
    );
  };

  if (photoUrls.length === 0) {
    return (
      <div
        style={{
          width: totalWidth,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          opacity: 0.3,
        }}
      >
        No images
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap,
      }}
    >
      {hasSplitLayout
        ? <>
            {/* Large image */}
            {photoUrls[0] && (
              <div
                style={{
                  display: 'flex',
                  width: cellWidth,
                  height: cellHeight * 2,
                }}
              >
                {renderPhoto(photoUrls[0], cellWidth, cellHeight * 2)}
              </div>
            )}

            {/* Small images */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: cellWidth,
                height: cellHeight,
              }}
            >
              {photoUrls.slice(1, count).map(photo =>
                renderPhoto(photo, cellWidth, cellHeight),
              )}
            </div>
          </>
        : photoUrls.slice(0, count).map(photo =>
            renderPhoto(photo, cellWidth, cellHeight),
          )}
    </div>
  );
}
