function myFunction() {
  const x = HtmlService.createHtmlOutputFromFile("example");
  const text = x.getContent();
  const nDlStart = text.match(/<DL>/g).length;
  const nDlEnd = text.match(/<\/DL>/g).length;
  console.log(`Number of <DL>: ${nDlStart}, <\/DL>: ${nDlEnd}`);

  const P = Parsimmon;
  const WhiteSpaces = P.regex(/\s*\r?\n?\s*/);
  const DtStart = P.seq(P.string("<DT>"), WhiteSpaces);
  const DtEnd = P.seq(P.string("</DT>"), WhiteSpaces);
  const PStart = P.seq(P.regexp(/<[Pp]>/), WhiteSpaces);
  const H1Start = P.seq(P.string("<H1>"), WhiteSpaces);
  const H1End = P.seq(P.string("</H1>"), WhiteSpaces);
  const DlStart = P.seq(P.string("<DL>"), WhiteSpaces, PStart.many(), WhiteSpaces);
  const DlEnd = P.seq(P.string("</DL>"), WhiteSpaces, PStart.many(), WhiteSpaces);

  const DoctypeParser = P.seq(P.string("<!DOCTYPE"), P.regexp(/[^>]+/), P.string('>'), WhiteSpaces);
  const CommentParser = P.seq(P.string("<!--"), P.regexp(/[^]*?(?=-->)/), P.string("-->"), WhiteSpaces);
  const MetaParser = P.seq(P.regex(/<META.+>/), WhiteSpaces);
  const TitleParser = P.seq(P.string("<TITLE"), P.regexp(/[^]*?(?=\/TITLE>)/), P.string("/TITLE>"), WhiteSpaces);
  const H1Parser = P.seq(H1Start, P.regexp(/[^]*?(?=<\/H1>)/), H1End, WhiteSpaces);
  const Header = P.seq(DoctypeParser, CommentParser, MetaParser, TitleParser, WhiteSpaces);

  const AttributeName = P.seq(P.regex(/[^= ]+/), WhiteSpaces);
  const AttributeValue = P.seq(P.regexp(/[^= ]+/), WhiteSpaces);
  const Attribute = P.seq(AttributeName, P.string("="), AttributeValue);

  const AngleLeft = P.seq(P.string("<"), WhiteSpaces);
  const AngleRight = P.seq(P.string(">"), WhiteSpaces);

  const H3Start = P.seq(AngleLeft, P.string("H3"), Attribute.many(), AngleRight);
  //P.regex(/<H3 .*?>/), WhiteSpaces);
  const H3End = P.seq(P.string("</H3>"), WhiteSpaces);
  const H3Skip = P.seq(P.regexp(/[^](.*)(?=<\/H3>)/), WhiteSpaces);
  const H3Parser = P.seq(H3Start, H3Skip, H3End, WhiteSpaces);

  //const AStart = P.seq(P.regex(/<A.*HREF=(.*)">/), WhiteSpaces);
  const AStart = P.seq(P.regexp(/<A[^>]*HREF=["']([^"']*)["'][^>]*>/i), WhiteSpaces);
  const AEnd = P.seq(P.string("</A>"), WhiteSpaces);
  const ASkip = P.seq(P.regexp(/[^](.*)(?=<\/A>)/), WhiteSpaces);
  const AParser = P.seq(AStart, ASkip, AEnd);

  const DdStart = P.seq(P.string("<DD"), WhiteSpaces);
  const DdSkip = P.seq(P.regexp(/[^]*?(?=<)/), WhiteSpaces);
  const DdParser = P.seq(DdStart, DdSkip, WhiteSpaces);

  const Bookmark = P.seq(DtStart, AParser, DdParser.many());

  const Folder = P.seq(DtStart, H3Parser, DlStart, Bookmark.many(), DlEnd);

  const Page = P.seq(DtStart, H3Parser, DlStart, Folder.many(), DlEnd);

  const All = P.seq(Header, H1Parser, DlStart, Page.many(), DlEnd);

  const result = All.tryParse(text);
  const pages = result[3];

  result[3].forEach(page=>{
    console.log(`Page: ${page[1][1][0]}`);
    page[3].forEach(folder=>{
      console.log(`Folder: ${folder[1][1][0]}`);
      folder[3].forEach(bookmark=>{
        console.log(`Bookmark: ${bookmark[1][0][0]}`);
      });
    });
  });
}
