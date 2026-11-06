import { afterEach, describe, expect, it, vi } from 'vitest';
import { restoreFocus, trapDialogFocus } from './modalFocus';

function focusable() {
    return {
        hidden: false,
        focus: vi.fn(),
        getAttribute: vi.fn(() => null),
    };
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('dialog focus trap', () => {
    it('wraps Tab from the final control to the first', () => {
        const first = focusable();
        const last = focusable();
        vi.stubGlobal('document', { activeElement: last });
        const event = { key: 'Tab', shiftKey: false, preventDefault: vi.fn() };

        trapDialogFocus(event, { querySelectorAll: () => [first, last] });

        expect(event.preventDefault).toHaveBeenCalledOnce();
        expect(first.focus).toHaveBeenCalledOnce();
    });

    it('wraps Shift+Tab from the first control to the final control', () => {
        const first = focusable();
        const last = focusable();
        vi.stubGlobal('document', { activeElement: first });
        const event = { key: 'Tab', shiftKey: true, preventDefault: vi.fn() };

        trapDialogFocus(event, { querySelectorAll: () => [first, last] });

        expect(event.preventDefault).toHaveBeenCalledOnce();
        expect(last.focus).toHaveBeenCalledOnce();
    });

    it('wraps Tab to the first control when the dialog container itself is focused', () => {
        const first = focusable();
        const last = focusable();
        const dialog = { querySelectorAll: () => [first, last] };
        vi.stubGlobal('document', { activeElement: dialog });
        const event = { key: 'Tab', shiftKey: false, preventDefault: vi.fn() };

        trapDialogFocus(event, dialog);

        expect(event.preventDefault).toHaveBeenCalledOnce();
        expect(first.focus).toHaveBeenCalledOnce();
    });

    it('wraps Shift+Tab to the last control when the dialog container itself is focused', () => {
        const first = focusable();
        const last = focusable();
        const dialog = { querySelectorAll: () => [first, last] };
        vi.stubGlobal('document', { activeElement: dialog });
        const event = { key: 'Tab', shiftKey: true, preventDefault: vi.fn() };

        trapDialogFocus(event, dialog);

        expect(event.preventDefault).toHaveBeenCalledOnce();
        expect(last.focus).toHaveBeenCalledOnce();
    });

    it('lets non-Tab keys pass through', () => {
        const first = focusable();
        vi.stubGlobal('document', { activeElement: first });
        const event = { key: 'Enter', shiftKey: false, preventDefault: vi.fn() };

        trapDialogFocus(event, { querySelectorAll: () => [first] });

        expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('lets Tab and Shift+Tab pass through from a middle control', () => {
        const first = focusable();
        const middle = focusable();
        const last = focusable();
        vi.stubGlobal('document', { activeElement: middle });

        for (const shiftKey of [false, true]) {
            const event = { key: 'Tab', shiftKey, preventDefault: vi.fn() };
            trapDialogFocus(event, { querySelectorAll: () => [first, middle, last] });
            expect(event.preventDefault).not.toHaveBeenCalled();
        }
    });

    it('restores focus to the control that opened the dialog', () => {
        const trigger = focusable();

        restoreFocus(trigger);

        expect(trigger.focus).toHaveBeenCalledOnce();
    });
});

describe('focus trap edge cases', () => {
    it('keeps focus on the dialog when it has no focusable controls', () => {
        const dialog = { querySelectorAll: () => [], focus: vi.fn() };
        const event = { key: 'Tab', preventDefault: vi.fn() };
        trapDialogFocus(event, dialog);
        expect(event.preventDefault).toHaveBeenCalledOnce();
        expect(dialog.focus).toHaveBeenCalledOnce();
    });

    it('ignores hidden and aria-hidden controls', () => {
        const hidden = { ...focusable(), hidden: true };
        const ariaHidden = { ...focusable(), getAttribute: vi.fn(() => 'true') };
        const only = focusable();
        vi.stubGlobal('document', { activeElement: only });
        const event = { key: 'Tab', shiftKey: false, preventDefault: vi.fn() };
        trapDialogFocus(event, { querySelectorAll: () => [hidden, ariaHidden, only] });
        expect(only.focus).toHaveBeenCalledOnce();
    });

    it('pulls focus back in when it is on the container or outside', () => {
        const first = focusable();
        const last = focusable();
        const dialog = { querySelectorAll: () => [first, last] };
        vi.stubGlobal('document', { activeElement: dialog });
        const fwd = { key: 'Tab', shiftKey: false, preventDefault: vi.fn() };
        trapDialogFocus(fwd, dialog);
        expect(first.focus).toHaveBeenCalledOnce();
        const back = { key: 'Tab', shiftKey: true, preventDefault: vi.fn() };
        trapDialogFocus(back, dialog);
        expect(last.focus).toHaveBeenCalledOnce();
    });

    it('does nothing for non-Tab keys, a missing dialog, or mid-list focus', () => {
        const a = focusable(); const b = focusable(); const c = focusable();
        vi.stubGlobal('document', { activeElement: b });
        const e1 = { key: 'Enter', preventDefault: vi.fn() };
        trapDialogFocus(e1, { querySelectorAll: () => [a, b, c] });
        const e2 = { key: 'Tab', preventDefault: vi.fn() };
        trapDialogFocus(e2, null);
        const e3 = { key: 'Tab', shiftKey: false, preventDefault: vi.fn() };
        trapDialogFocus(e3, { querySelectorAll: () => [a, b, c] });
        for (const e of [e1, e2, e3]) expect(e.preventDefault).not.toHaveBeenCalled();
    });

    it('restoreFocus tolerates null targets and targets without focus', () => {
        const target = { focus: vi.fn() };
        restoreFocus(target);
        expect(target.focus).toHaveBeenCalledOnce();
        expect(() => restoreFocus(null)).not.toThrow();
        expect(() => restoreFocus({})).not.toThrow();
    });
});
