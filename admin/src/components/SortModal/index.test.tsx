import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SortModal from './index';

const mockConfigResponse = {
    data: {
        data: {
            contentType: {
                uid: 'api::article.article',
                settings: { mainField: 'title', pageSize: 10 },
            },
        },
    },
};

const mockSettingsResponse = {
    data: { body: { rank: 'rank', title: '', subtitle: '', triggerWebhooks: false } },
};

const mockEntries = [
    { id: 1, rank: 1 },
    { id: 2, rank: 2 },
];

vi.mock('@strapi/strapi/admin', () => ({
    useFetchClient: () => ({
        get: vi.fn().mockImplementation((url: string) => {
            if (url.includes('/configuration')) return Promise.resolve(mockConfigResponse);
            if (url.includes('/settings')) return Promise.resolve(mockSettingsResponse);
            if (url.includes('/collection-types/'))
                return Promise.resolve({
                    data: { pagination: { page: 1, pageCount: 1, pageSize: 10, total: 2 }, results: mockEntries },
                });
            return Promise.resolve({ data: {} });
        }),
        post: vi.fn().mockResolvedValue({ data: mockEntries }),
        put: vi.fn().mockResolvedValue({ data: {} }),
    }),
    useNotification: () => ({ toggleNotification: vi.fn() }),
    useAPIErrorHandler: () => ({ formatAPIError: vi.fn() }),
}));

vi.mock('../../utils/useQueryParams', () => ({
    useQueryParams: () => ({ queryParams: { pageSize: '10', page: '1' } }),
}));

vi.mock('./SortMenu', () => ({
    default: ({ status }: { status: string }) => (
        <div data-testid="sort-menu" data-status={status} />
    ),
}));

describe('SortModal', () => {
    it('starts as loading then reaches success when pageSize is provided', async () => {
        render(<SortModal />);
        expect(screen.getByTestId('sort-menu')).toHaveAttribute('data-status', 'loading');

        await waitFor(() => {
            expect(screen.getByTestId('sort-menu')).toHaveAttribute('data-status', 'success');
        });
    });
});
