'use strict';
const alfy = require('alfy');
const translate = require('china-google-translate-api');
const isChinese = require('is-chinese');
const axios = require('axios')

const q = alfy.input;
const to = isChinese(q) ? 'en' : 'zh-CN';
const from = isChinese(q) ? 'zh-CN' : 'en';

translate(q, {raw: true, to: to}).then(data => {
  const output = {
    variables: {
      pronounce: 0
    }, 
    items: []
  };

  const rawObj = JSON.parse(data.raw);
  if (!data.from.text.autoCorrected) {
    if (rawObj[1]) {
      rawObj[1].forEach(r => {
        const partOfSpeech = r[0];
        r[2].forEach(x => {
          const text = x[0];
          const relation = x[1];
          output.items.push({ 
            title: text, 
            subtitle: `(${partOfSpeech}) ${relation.join(', ')}`, 
            arg: text,
            mods: {
              cmd: {
                subtitle: '请按 ⌅ 发音',
                variables: {
                  pronounce: 1
                }
              }
            },
            quicklookurl: `https://translate.google.cn/#${from}/${to}/${encodeURIComponent(q)}`
          });
        });
      });
    } else {
      output.items.push({ 
        title: data.text, 
        subtitle: '', 
        arg: data.text,
        mods: {
          cmd: {
            subtitle: '请按 ⌅ 发音',
            variables: {
              pronounce: 1
            }
          }
        },
        quicklookurl: `https://translate.google.cn/#${from}/${to}/${encodeURIComponent(q)}` 
      });
    }
  } else {
    const corrected = data.from.text.value.replace(/\[/, '').replace(/\]/, '');
    output.items.push({ 
      title: data.text, 
      subtitle: `您要查询的是 ${corrected} 吗?, 请按 ⇥ 查询更多`, 
      autocomplete: corrected 
    });
  }

  if (rawObj[1]) {
    axios.get('http://139.199.25.180:8001/tool/words/' + q)
  }
  console.log(JSON.stringify(output, null, '\t'));
});
