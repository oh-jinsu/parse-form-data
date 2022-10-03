export const getBoundary = (contentType: string): string | undefined => {
  const keyword = "boundary=";

  const index = contentType.indexOf(keyword);

  if (index === -1) {
    return;
  }

  return `--${contentType.substring(index + keyword.length)}`;
};

export const parse = (buffer: Buffer, boundary: string) =>
  split(buffer, boundary).map((buffer) => ({
    filename: extractFilename(buffer),
    type: extractType(buffer),
    data: extractData(buffer),
  }));

export const split = (buffer: Buffer, boundary: string, index = 0): Buffer[] => {
  const start = buffer.indexOf(boundary, index);

  if (start !== -1) {
    const end = buffer.indexOf(boundary, start + boundary.length);

    const result = buffer.subarray(start, end);

    if (result.includes(`${boundary}--`)) {
      return [];
    }

    return [result, ...split(buffer, boundary, end)];
  }

  return [];
};

const extractFilename = (buffer: Buffer): string => {
  const symbol = "filename=";

  const index = buffer.indexOf(symbol);

  if (index === -1) {
    return "";
  }

  const start = index + symbol.length;

  const end = buffer.indexOf("\r\n", start);

  if (end === -1) {
    return "";
  }

  return buffer.subarray(start, end).toString().replace(/('|")/, "");
};

const extractType = (buffer: Buffer): string => {
  const symbol = "Content-Type: ";

  let index = buffer.indexOf(symbol);

  if (index === -1) {
    index = buffer.indexOf(symbol.toLowerCase());
  }

  if (index === -1) {
    return "";
  }

  const start = index + symbol.length;

  const end = buffer.indexOf("\r\n", start);

  if (end === -1) {
    return "";
  }

  return buffer.subarray(start, end).toString();
};

const extractData = (buffer: Buffer): Buffer => {
  const symbol = Buffer.from("\r\n\r\n");

  const initial = buffer.indexOf(symbol);

  for (let i = initial + symbol.length; i < buffer.length; i++) {
    const byte = buffer[i];

    if (byte === 0x0a || byte === 0x0d) {
      continue;
    }

    if (buffer.subarray(i - symbol.length, i).equals(symbol)) {
      const start = i;

      return buffer.subarray(start);
    }
  }

  return Buffer.alloc(0);
};
