import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';

import './dt-location.js';

const options = [{
  id: 'opt1',
  label: 'Option 1',
}, {
  id: 'opt2',
  label: 'Second Option',
}, {
  id: 'opt3',
  label: 'Option Three',
}];
const filters = [{
  id: 'focus',
  label: 'Region of Focus',
}, {
  id: 'all',
  label: 'All Locations',
}];
async function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function clickOption(el, id) {
  const input = el.shadowRoot.querySelector('input');
  const optionBtn = el.shadowRoot.querySelector(`.option-list button[value=${id}]`);

  input.focus();

  optionBtn.click();

}

describe('dt-location', () => {

  it('sets placeholder', async () => {
    const el = await fixture(html`<dt-location placeholder="Custom Placeholder"></dt-location>`);
    const input = el.shadowRoot.querySelector(('input'));

    expect(input.placeholder).to.equal('Custom Placeholder');
  });

  it('sets options', async () => {
    const el = await fixture(html`<dt-location options="${JSON.stringify(options)}"></dt-location>`);
    const optionList = el.shadowRoot.querySelector('.option-list');

    expect(optionList.children).to.have.lengthOf(3);
    expect(optionList).to.contain('button[value=opt1]');
    expect(optionList).to.contain('button[value=opt2]');
    expect(optionList).to.contain('button[value=opt3]');

    expect(optionList).not.to.be.displayed;
  });

  it('sets filters', async () => {
    const el = await fixture(html`<dt-location options="${JSON.stringify(options)}" filters="${JSON.stringify(filters)}"></dt-location>`);
    const select = el.shadowRoot.querySelector('select');

    expect(select).to.exist;
    expect(select).to.have.descendant('option[value="focus"]').with.text('Region of Focus');
    expect(select).to.have.descendant('option[value="all"]').with.text('All Locations');

  });

  it('sets selection from attribute', async () => {
    const el = await fixture(html`<dt-location value="${JSON.stringify([options[0],options[1]])}" options="${JSON.stringify(options)}"></dt-location>`);
    const container = el.shadowRoot.querySelector('.field-container');

    expect(container).to.contain('button[data-value=opt1]');
    expect(container).to.contain('button[data-value=opt2]');
    expect(container).not.to.contain('button[data-value=opt3]');
  });

  it('opens option list on input focus', async () => {
    const el = await fixture(html`<dt-location options="${JSON.stringify(options)}"></dt-location>`);
    const input = el.shadowRoot.querySelector('input');
    const optionList = el.shadowRoot.querySelector('.option-list');

    expect(optionList).not.to.be.displayed;

    input.focus();
    await wait( 50); // wait for UI update

    expect(optionList).to.be.displayed;
  });

  it('selects option via mouse', async () => {
    const el = await fixture(html`<dt-location options="${JSON.stringify(options)}"></dt-location>`);
    const input = el.shadowRoot.querySelector('input');
    const optionBtn = el.shadowRoot.querySelector('.option-list button[value=opt1]');

    input.focus();

    optionBtn.click();
    await wait(100);

    const container = el.shadowRoot.querySelector('.field-container');
    expect(container).to.contain('button[data-value=opt1]');
  });

  it('selects option via keyboard', async () => {
    const el = await fixture(html`<dt-location options="${JSON.stringify(options)}"></dt-location>`);
    const input = el.shadowRoot.querySelector('input');
    input.focus();

    await sendKeys({
      press: 'ArrowDown',
    });
    await sendKeys({
      press: 'Enter',
    });

    const container = el.shadowRoot.querySelector('.field-container');
    expect(container).to.contain('button[data-value=opt1]');
  });

  it('updates value attribute', async () => {
    const el = await fixture(html`<dt-location options="${JSON.stringify(options)}"></dt-location>`);

    await clickOption(el, 'opt1');

    expect(el).to.have.attr('value', JSON.stringify([options[0]]));
  });

  it('triggers change event', async () => {
    const el = await fixture(html`<dt-location name="custom-name" value="${JSON.stringify([options[1]])}" options="${JSON.stringify(options)}"></dt-location>`);

    setTimeout(() => clickOption(el, 'opt1'));

    const { detail } = await oneEvent(el, 'change');

    expect(detail.field).to.equal('custom-name');
    expect(detail.oldValue).to.eql([options[1]]);
    expect(detail.newValue).to.eql([options[1], options[0]]);
  });

  it('filters options on text input', async () => {
    const el = await fixture(html`<dt-location options="${JSON.stringify(options)}"></dt-location>`);
    const input = el.shadowRoot.querySelector('input');
    const optionsList = el.shadowRoot.querySelector('.option-list');
    input.focus();

    await sendKeys({
      type: 'Sec',
    });

    expect(optionsList).to.be.displayed;
    expect(optionsList).to.contain('button[value=opt2]');
    expect(optionsList).not.to.contain('button[value=opt1]');
    expect(optionsList).not.to.contain('button[value=opt3]');
  });

  it('filters options on option selection', async () => {
    const el = await fixture(html`<dt-location options="${JSON.stringify(options)}"></dt-location>`);
    const input = el.shadowRoot.querySelector('input');
    const optionsList = el.shadowRoot.querySelector('.option-list');
    input.focus();
    await clickOption(el, 'opt1');

    expect(optionsList).not.to.contain('button[value=opt1]');
    expect(optionsList).to.contain('button[value=opt2]');
    expect(optionsList).to.contain('button[value=opt3]');
  });

  it('loads options from event if no options provided', async () => {
    const el = await fixture(html`<dt-location name="custom-name" value="${JSON.stringify([options[1]])}" filters="${JSON.stringify(filters)}"></dt-location>`);
    const input = el.shadowRoot.querySelector('input');
    input.focus();

    setTimeout(() => sendKeys({type: 'o'}));

    const { detail } = await oneEvent(el, 'load');

    expect(detail.field).to.equal('custom-name');
    expect(detail.query).to.equal('o');
    expect(detail.filter).to.equal('focus');
    expect(detail.onSuccess).to.exist;

    await detail.onSuccess([options[0]]);

    const optionList = el.shadowRoot.querySelector('.option-list');
    expect(optionList).to.contain('button[value=opt1]');
    expect(optionList).not.to.contain('button[value=opt2]');
    expect(optionList).not.to.contain('button[value=opt3]');
  });

  it('allows adding new option', async () => {
    const el = await fixture(html`<dt-location options="${JSON.stringify(options)}"></dt-location>`);
    el.shadowRoot.querySelector('input').focus();

    await sendKeys({
      type: 'new',
    });

    await sendKeys({ press: 'ArrowDown' });
    await sendKeys({ press: 'Enter' });

    expect(el.value).not.to.be.empty;
    expect(el.value).to.eql([{
      id: '',
      label: 'new',
      isNew: true,
    }]);
  });

  it('disables inputs', async () => {
    const el = await fixture(html`<dt-location disabled></dt-location>`);

    const input = el.shadowRoot.querySelector(('input'));
    expect(input).to.have.attribute('disabled');

    const select = el.shadowRoot.querySelector(('select'));
    expect(select).to.have.attribute('disabled');
  });
});
