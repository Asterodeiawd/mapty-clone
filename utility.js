const _toCamelCase = text =>
  text
    .split("-")
    .map((word, index) =>
      index ? word[0].toUpperCase().concat(word.slice(1)) : word
    )
    .join("");
