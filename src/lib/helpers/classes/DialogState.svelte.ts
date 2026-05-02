import { pushState, replaceState } from '$app/navigation';
import { page } from '$app/state';

export class DialogState {
    public id?: string;
    public dialogURL?: string;

    public isClosable = $state(true);
    public isOpen: boolean = $state(false);
    public isActive: boolean = $derived(
        !!this.id &&
        !!page.state.dialogs?.length &&
        page.state.dialogs.at(-1) === this.id
    );

    public mode: Record<'open'|'close', DialogState.ActionMode> = {
        open: 'push',
        close: 'replace'
    };


    constructor(options?: DialogState.Options) {
        Object.assign(this, options);

        this.mode = typeof options?.mode == 'string'
            ? { open: options.mode, close: options.mode }
            : options?.mode ?? this.mode;

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    public open(options?: Partial<Omit<DialogState.SetDialogsOptions, 'dialogs'>>) {
        this.isOpen = true;

        if (this.id && !this.isActive) {
            DialogState.addDialog(this.id, {
                mode: this.mode.open,
                url: this.dialogURL,
                ...options
            });
        }
    }

    public close(options?: Partial<Omit<DialogState.SetDialogsOptions, 'dialogs'>> & { force?: boolean }) {
        if (!this.isClosable) {
            if (!options?.force) {
                return;
            }

            this.isClosable = true;
        }

        this.isOpen = false;

        if (this.id && this.isActive) {
            DialogState.removeDialog(this.id, {
                mode: this.mode.close,
                url: this.dialogURL,
                ...options
            });
        }
    }

    public toggle(value?: boolean) {
        value ??= !this.isOpen;

        if (value) {
            this.open();
        } else {
            this.close();
        }
    }
}

export namespace DialogState {
    export type ActionMode = 'push'|'replace';

    export interface Options {
        id?: string;
        open?: boolean;
        dialogURL?: string;
        mode?: ActionMode|Record<'open'|'close', ActionMode>;
    }

    export interface SetDialogsOptions {
        dialogs: string[];
        mode: ActionMode;
        url?: string;
    }

    export function addDialog(id: string,  options: Omit<SetDialogsOptions, 'dialogs'>): void {
        const { dialogs } = page.state;

        if (dialogs?.includes(id)) return;

        setDialogs({
            dialogs: [...(dialogs ?? []), id],
            ...options
        });
    }

    export function removeDialog(id: string, options: Omit<SetDialogsOptions, 'dialogs'>): void {
        const { dialogs } = page.state;

        if (!dialogs?.includes(id)) return;

        setDialogs({
            dialogs: dialogs.filter(dialog => dialog !== id),
            ...options
        });
    }

    export function setDialogs(options: SetDialogsOptions): void {
        const { dialogs, mode, url } = options;

        switch (mode) {
            case 'push':
                // eslint-disable-next-line svelte/no-navigation-without-resolve
                return pushState(url ?? '', { ...page.state, dialogs });
            case 'replace':
                // eslint-disable-next-line svelte/no-navigation-without-resolve
                return replaceState(url ?? '', { ...page.state, dialogs });
        }
    }
}
