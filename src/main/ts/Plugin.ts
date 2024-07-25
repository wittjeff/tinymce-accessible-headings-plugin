import { Editor, TinyMCE } from 'tinymce';

declare const tinymce: TinyMCE;

// Generate a unique ID for each heading
const generateUniqueId = (() => {
  let counter = 0;
  return () => `heading-${++counter}`;
})();

const setup = (editor: Editor): void => {
  editor.ui.registry.addButton('headings-test', {
    text: 'Hx',
    tooltip: 'Adjust heading semantic levels',
    onAction: () => {
      const content = editor.getContent({ format: 'html' });
      const headings = extractHeadings(content);
      let currentIndex = 0;

      const updateDialogContent = (dialogApi: any) => {
        dialogApi.setData({
          level: headings[currentIndex].level.toString(),
          headingText: headings[currentIndex].text,
          isFirstHeading: currentIndex === 0,
          isLastHeading: currentIndex === headings.length - 1
        });
      };

      const dialogConfig = (isFirst: boolean, isLast: boolean): any => ({
        title: 'Headings',
        size: 'normal',
        body: {
          type: 'panel',
          items: [
            {
              type: 'htmlpanel',
              html: `<p id="heading-text" style="font-family: Courier Sans;">${headings[currentIndex].text} <span style="font-weight: bold;">(Heading ${currentIndex + 1} of ${headings.length})</span></p>`
            },
            {
              type: 'input',
              name: 'level',
              inputMode: 'numeric',
              label: 'Level',
              value: headings[currentIndex].level.toString(),
              min: 1,
              max: 8,
              placeholder: 'Enter heading level'
            }
          ]
        },
        buttons: [
          {
            type: 'custom',
            name: 'prev',
            text: 'Previous',
            primary: false,
            disabled: isFirst
          },
          {
            type: 'custom',
            name: 'next',
            text: 'Next',
            primary: false,
            disabled: isLast
          },
          {
            type: 'cancel',
            text: 'Cancel'
          },
          {
            type: 'submit',
            text: 'OK',
            primary: true
          }
        ],
        initialData: {
          level: headings[currentIndex].level.toString(),
          headingText: headings[currentIndex].text,
          isFirstHeading: isFirst,
          isLastHeading: isLast
        },
        onChange: () => {
          
          // Handle changes in the input fields if necessary
        },
        onAction: (api: any, details: any) => {
          if (details.name === 'next') {
            if (currentIndex < headings.length - 1) {
              currentIndex++;
              api.redial(dialogConfig(currentIndex === 0, currentIndex === headings.length - 1));
              updateDialogContent(api);
            }
          } else if (details.name === 'prev') {
            if (currentIndex > 0) {
              currentIndex--;
              api.redial(dialogConfig(currentIndex === 0, currentIndex === headings.length - 1));
              updateDialogContent(api);
            }
          }
        },
        onSubmit: (api: any) => {
          const data = api.getData();
          headings[currentIndex].level = parseInt(data.level, 10);
          const current_changed_Heading = headings[currentIndex].level;
          const { all_heading } = getEditorHeadings(editor);
          const headingLevels = Array.from(all_heading).map(heading => parseInt((heading.tagName.match(/h(\d)/i) || [])[1], 10));
          headingLevels[currentIndex]=current_changed_Heading;
          console.log(headingLevels);
          let h1Count = 0;
          all_heading.forEach(heading => {
          if (heading.tagName.toLowerCase() === 'h1') {
            h1Count++;
          }
          });
          if(current_changed_Heading<1 || current_changed_Heading>6)
          {
            display_Error_Message(editor,'Choose a heading tag between 1-6');
          }
          else if(h1Count === 1 && current_changed_Heading === 1 )
          {
            display_Error_Message(editor,'Only one Heading 1 can exist at a time.');
          }
          else if(!headings_inOrder(headingLevels))
          {
            display_Error_Message(editor,'Headings are not in increment order');
          }
          else{
            applyHeadingLevels(editor, headings);
          }
          api.close();
        }
      });

      const dialogApi = editor.windowManager.open(dialogConfig(currentIndex === 0, currentIndex === headings.length - 1));
      updateDialogContent(dialogApi);
    }
  });

  // Attach NodeChange event listener with better handling
  editor.on('NodeChange', () => {
    const { doc,all_heading } = getEditorHeadings(editor,true);
    let contentChanged = false;
    all_heading.forEach(heading => {
      if (!heading.id) {
        heading.id = generateUniqueId();
        contentChanged = true;
      }
    });

    if (contentChanged) {
      editor.undoManager.transact(() => {
        editor.setContent(doc.body.innerHTML, { format: 'raw' });
        editor.selection.setCursorLocation(doc.body.lastChild, 0);
      });
    }
  });
};

// Extract headings and their levels from the content using id
const extractHeadings = (content: string) => {
  const headingRegex = /<(h[1-8])([^>]*id="([^"]+)"[^>]*)>/gi;
  let match: RegExpExecArray | null;
  const headings = [];

  while ((match = headingRegex.exec(content)) !== null) {
    const tag = match[1];
    const level = parseInt(tag.replace(/\D/g, ''), 10);
    const id = match[3];
    const text = match.input.split('>').pop()?.split('<')[0] || ''; // Extract text between tags
    headings.push({ tag, level, text, id });
  }

  return headings;
};

// Apply the updated heading levels to the content using id
const applyHeadingLevels = (editor: Editor, headings: any[]) => {
  let content = editor.getContent({ format: 'html' });

  headings.forEach((heading) => {
    const newTag = `h${heading.level}`;
    const oldTag = heading.tag;
    const id = heading.id;
    const regex = new RegExp(`(<${oldTag}[^>]*id="${id}"[^>]*>)(.*)(</${oldTag}>)`, 'gi');

    content = content.replace(regex, `<${newTag} id="${id}">$2</${newTag}>`);
  });

  editor.setContent(content);
};

function display_Error_Message(editor,message)
{
    editor.notificationManager.open({
      text: message,
      type: 'error',
      timeout: 3000
    });
}

function headings_inOrder(headingLevels)
{
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] < headingLevels[i - 1]) {
      return false;
    }
  }
  return true;
}

function getEditorHeadings(editor, includeDoc = false) {
  const content = editor.getContent({ format: 'html' });
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  const all_heading = doc.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"][aria-level]');
  
  if (includeDoc) {
    return { doc, all_heading };
  } else {
    return { all_heading };
  }
}

export default (): void => {
  tinymce.PluginManager.add('headings-test', setup);
};
