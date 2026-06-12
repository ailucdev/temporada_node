function eliminaSuperpostos(externalEvents) {
/*
  externalEvents = [
    { "id": "vfb62017467488000001747008000000airbnb", "origem": "AIRBNB", "start": "2025-05-09", "end": "2025-05-12", "summary": "Reserve", "description": "", "value": 0, "UID": "1418fb94e984-34b394ade5ebf690e4c58069081fa99b@airbnb.co", "stamp": "2025-05-04", "colorId": 4 },
    { "id": "vfb62017466624000001746748800000airbnb", "origem": "AIRBNB", "start": "2025-05-08", "end": "2025-05-10", "summary": "Airbnb (Not available", "description": "", "value": 0, "UID": "7f662ec65913-640451b66104740543f166b5c68aae78@airbnb.co", "stamp": "2025-05-04", "colorId": 4 }, { "id": "vfb62017463168000001746489600000airbnb", "origem": "AIRBNB", "start": "2025-05-04", "end": "2025-05-08", "summary": "Airbnb (Not available", "description": "", "value": 0, "UID": "7f662ec65913-d1b219f53111e27be3d433974d9e92e5@airbnb.co", "stamp": "2025-05-04", "colorId": 4 }, { "id": "vfb62017458848000001746403200000booking", "origem": "BOOKING", "start": "2025-04-29", "end": "2025-05-05", "summary": "CLOSED - Not availabl", "description": "", "value": 0, "UID": "2055786678036cbf24a2beb8b8ab804e@booking.co", "stamp": "2025-05-04", "colorId": 9 }]
*/
  const result = [];
  for (const current of externalEvents) {
    const currentStart = new Date(current.start);
    const currentEnd = new Date(current.end);
    const currentDuration = getDays(current.start, current.end);
    let conflictIndex = -1;

    for (let i = 0; i < result.length; i++) {
      const existing = result[i];
      // Apenas se a origem for a mesma
      if (existing.origem !== current.origem) continue;
      const existingStart = new Date(existing.start);
      const existingEnd = new Date(existing.end);
      const overlaps = currentStart < existingEnd && currentEnd > existingStart;
      if (overlaps) {
        const existingDuration = getDays(existing.start, existing.end);
        if (currentDuration > existingDuration) {
          conflictIndex = i; // marcar para substituir
        } else {
          conflictIndex = -2; // conflito com maior ou igual, não adiciona
        }
        break;
      }
    }
    if (conflictIndex === -1) {
      // sem conflito, adiciona normalmente
      result.push(current);
    } else if (conflictIndex >= 0) {
      // substituir período menor
      result[conflictIndex] = current;
    }
    // se conflictIndex === -2 → conflito com período maior, ignora
  }
  console.log("Sem superposições: ", result)
  return result;

  function getDays(start, end) {
    return (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
  }
}