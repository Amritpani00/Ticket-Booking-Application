import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

beforeEach(() => {
	vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => [] })) as any);
});

describe('App', () => {
	it('renders title', () => {
		const r = render(
			<MemoryRouter>
				<App />
			</MemoryRouter>
		);
		expect(r.container.textContent).toContain('Ticket Booking');
	});
});