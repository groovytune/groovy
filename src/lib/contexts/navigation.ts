import { Context } from 'runed';

export const ActiveNavigationPageContext = new Context<Record<'id', string>>('activeNavigationPage');
