// emoji-picker.js
document.addEventListener('DOMContentLoaded', () => {
  const picker = new EmojiButton({
    position: 'top-end',
    theme: 'dark'
  });

  const input = document.querySelector('#input');
  const emojiBtn = document.querySelector('#emoji-btn');

  // Insert emoji at cursor position
  picker.on('emoji', emoji => {
    insertAtCursor(input, emoji);
    input.focus();
  });

  // Toggle emoji picker
  emojiBtn.addEventListener('click', () => {
    picker.togglePicker(emojiBtn);
  });

  // Cursor insertion helper
  function insertAtCursor(inputEl, textToInsert) {
    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    inputEl.value = inputEl.value.substring(0, start) + textToInsert + inputEl.value.substring(end);
    inputEl.selectionStart = inputEl.selectionEnd = start + textToInsert.length;
  }
});
