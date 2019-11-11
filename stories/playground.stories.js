/* eslint-disable import/extensions */
import { html } from 'lit-html';
import { withKnobs, withWebComponentsKnobs, text } from '@open-wc/demoing-storybook';

import '../authorization-method.js';

export default {
  title: 'AuthorizationMethod|Playground',
  component: 'authorization-method',
  decorators: [withKnobs, withWebComponentsKnobs],
  parameters: { options: { selectedPanel: 'storybookjs/knobs/panel' } },
};

export const singleComponent = () => html`
  <authorization-method></authorization-method>
`;

export const manualContent = () => html`
  <authorization-method>
    <p>${text('Content', 'Some text', 'Properties')}</p>
  </authorization-method>
`;
