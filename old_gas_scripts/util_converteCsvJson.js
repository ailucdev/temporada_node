  function util_converteCsvJson(csv) {
    // \n or \r\n depending on the EOL sequence
    const lines = csv.split('\n');
    const delimeter = ';';
    const result = [];
    const headers = lines[0].split(delimeter);
    for (const line of lines) {
      const obj = {};
      const row = line.split(delimeter);
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        obj[header] = row[i];
      }
      result.push(obj);
    }
    return result;
  }
