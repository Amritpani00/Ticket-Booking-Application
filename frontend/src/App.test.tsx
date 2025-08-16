import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';

beforeEach(() => {
	vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => [] })) as any);
});

describe('App', () => {
	it('renders title', () => {
		const r = render(<App />);
		expect(r.container.textContent).toContain('Ticket Booking');
	});
});