exports.patterns = {
  webpageUrl: /^https?:\/\/([^\s/?.#-]+\.?)+(\/[^\s]*)?$/,
  phone: /[-+0-9()# ]{6,}/,
  email: /^[-.\w]+@([\w-]+\.)+[\w-]{2,12}$/,
  singleword: /^\s*\S+\s*$/,
  doubleword: /^\s*(\S+\s*){1,2}$/
};
