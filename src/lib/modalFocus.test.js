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
