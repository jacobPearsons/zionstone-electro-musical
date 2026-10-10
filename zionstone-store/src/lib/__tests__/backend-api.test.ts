import {
  ApiError,
  BASE,
  calculateShipping,
  getShippingMethods,
  initializePaystack,
  listQueue,
  setQueueStatus,
  submitProduct,
  verifyPaystack,
} from '../backend-api';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('backend-api', () => {
  it('exposes a normalised base URL with no trailing slash', () => {
    expect(BASE.length).toBeGreaterThan(0);
    expect(BASE.endsWith('/')).toBe(false);
  });

  it('submitProduct unwraps the product on 201', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ ok: true, product: { id: 'p1', name: 'Axe' } }, 201));

    const result = await submitProduct(new FormData());

    expect(result).toEqual({ ok: true, product: { id: 'p1', name: 'Axe' } });
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE}/api/queue/products`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('surfaces the API rate-limit message and 429 status', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse(
        { ok: false, error: 'Too many submissions from this connection. Please try again later.' },
        429
      )
    );

    await expect(submitProduct(new FormData())).rejects.toMatchObject({
      status: 429,
      message: 'Too many submissions from this connection. Please try again later.',
    });
    await expect(submitProduct(new FormData())).rejects.toBeInstanceOf(ApiError);
  });

  it('flags a 503 as unavailable so the UI can show its message', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse(
        { ok: false, error: 'Payment temporarily unavailable — try again shortly.' },
        503
      )
    );

    const error = await initializePaystack({
      email: 'buyer@example.com',
      items: [{ productId: 'p1', quantity: 1 }],
      shippingMethodId: 'standard',
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).isUnavailable).toBe(true);
  });

  it('listQueue sends the bearer token and defaults missing items to []', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }));

    const result = await listQueue('pending', 'token-123');

    expect(result).toEqual({ ok: true, items: [] });
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE}/api/queue?status=pending`,
      expect.objectContaining({
        headers: { Authorization: 'Bearer token-123' },
        cache: 'no-store',
      })
    );
  });

  it('setQueueStatus encodes the id and returns the refreshed items', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ ok: true, items: [{ id: 'x' }] }));

    const result = await setQueueStatus('id/with space', 'approve', 'tok');

    expect(result.items).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE}/api/queue/id%2Fwith%20space`,
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('verifyPaystack treats a soft ok:false as an error carrying the status', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ ok: false, status: 'abandoned' }, 200));

    const error = await verifyPaystack('ref-1').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).data).toMatchObject({ status: 'abandoned' });
  });

  it('reads the shipping envelopes that use success:true', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: true, data: [{ id: 'standard', name: 'Standard', price: 8985 }] })
    );
    const methods = await getShippingMethods();
    expect(methods.data[0]?.id).toBe('standard');

    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: true, data: { methods: [], estimatedDeliveryDates: {} } })
    );
    const calc = await calculateShipping({ zipCode: '90210' });
    expect(calc.data).toEqual({ methods: [], estimatedDeliveryDates: {} });
  });
});
