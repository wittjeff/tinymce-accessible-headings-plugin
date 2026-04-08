import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/mcagar';

import Plugin from '../../../main/ts/Plugin';

// This an example of a browser test of the editor.
describe('browser.PluginTest', () => {
  const hook = TinyHooks.bddSetup({
    plugins: 'a11y-headings',
    toolbar: 'a11y-headings'
  }, [ Plugin ]);

  it('test click on button', () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, 'button:contains("a11y-headings button")');
    TinyAssertions.assertContent(editor, '<p>content added from a11y-headings</p>');
  });
});
