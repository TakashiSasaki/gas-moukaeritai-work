/**
 * Returns a sample Moodle XML string for multiple-choice questions.
 * @return {string} Sample Moodle XML.
 */
function getSampleMultichoiceXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<quiz>
<!-- question: 0  -->
  <question type="category">
    <category>
      <text>$course$/top/第4章-コンピュータ</text>
    </category>
    <info format="html">
      <text></text>
    </info>
    <idnumber></idnumber>
  </question>

<!-- question: 1049371  -->
  <question type="multichoice">
    <name>
      <text>NC4-01-01</text>
    </name>
    <questiontext format="html">
      <text><![CDATA[<p>「コンピュータの五大機能」に<strong>含まれない</strong>機能を選択してください。</p>]]></text>
    </questiontext>
    <generalfeedback format="html">
      <text></text>
    </generalfeedback>
    <defaultgrade>2.0000000</defaultgrade>
    <penalty>0.0000000</penalty>
    <hidden>0</hidden>
    <idnumber></idnumber>
    <single>true</single>
    <shuffleanswers>true</shuffleanswers>
    <answernumbering>ABCD</answernumbering>
    <showstandardinstruction>1</showstandardinstruction>
    <correctfeedback format="moodle_auto_format">
      <text></text>
    </correctfeedback>
    <partiallycorrectfeedback format="moodle_auto_format">
      <text></text>
    </partiallycorrectfeedback>
    <incorrectfeedback format="moodle_auto_format">
      <text></text>
    </incorrectfeedback>
    <answer fraction="100" format="moodle_auto_format">
      <text>通信機能（LAN部分）</text>
      <feedback format="moodle_auto_format">
        <text></text>
      </feedback>
    </answer>
    <answer fraction="0" format="moodle_auto_format">
      <text>記憶機能（メモリ部分）</text>
      <feedback format="moodle_auto_format">
        <text></text>
      </feedback>
    </answer>
    <answer fraction="0" format="moodle_auto_format">
      <text>入力機能、出力機能（コンピュータの入出力装置部分）</text>
      <feedback format="moodle_auto_format">
        <text></text>
      </feedback>
    </answer>
    <answer fraction="0" format="moodle_auto_format">
      <text>演算機能、制御機能（CPU部分）</text>
      <feedback format="moodle_auto_format">
        <text></text>
      </feedback>
    </answer>
  </question>

<!-- question: 1049372  -->
  <question type="multichoice">
    <name>
      <text>NC4-01-02</text>
    </name>
    <questiontext format="html">
      <text><![CDATA[<p>「コンピュータの五大機能」に<strong>含まれない</strong>機能を選択してください。</p>]]></text>
    </questiontext>
    <generalfeedback format="html">
      <text></text>
    </generalfeedback>
    <defaultgrade>2.0000000</defaultgrade>
    <penalty>0.0000000</penalty>
    <hidden>0</hidden>
    <idnumber></idnumber>
    <single>true</single>
    <shuffleanswers>true</shuffleanswers>
    <answernumbering>ABCD</answernumbering>
    <showstandardinstruction>1</showstandardinstruction>
    <correctfeedback format="moodle_auto_format">
      <text></text>
    </correctfeedback>
    <partiallycorrectfeedback format="moodle_auto_format">
      <text></text>
    </partiallycorrectfeedback>
    <incorrectfeedback format="moodle_auto_format">
      <text></text>
    </incorrectfeedback>
    <answer fraction="0" format="moodle_auto_format">
      <text>記憶機能（メモリ部分）</text>
      <feedback format="moodle_auto_format">
        <text></text>
      </feedback>
    </answer>
    <answer fraction="100" format="moodle_auto_format">
      <text>グラフィックス（ユーザインターフェース）</text>
      <feedback format="moodle_auto_format">
        <text></text>
      </feedback>
    </answer>
    <answer fraction="0" format="moodle_auto_format">
      <text>入力機能、出力機能（コンピュータの入出力装置部分）</text>
      <feedback format="moodle_auto_format">
        <text></text>
      </feedback>
    </answer>
    <answer fraction="0" format="moodle_auto_format">
      <text>演算機能、制御機能（CPU部分）</text>
      <feedback format="moodle_auto_format">
        <text></text>
      </feedback>
    </answer>
  </question>
</quiz>`;
}