import { gql } from '@apollo/client'
import { memo } from 'react'
import styled from 'styled-components'

import { Alert, Skeleton, Typography } from '~/components/designSystem'
import { intlFormatNumber } from '~/core/formats/intlFormatNumber'
import { deserializeAmount } from '~/core/serializers/serializeAmount'
import { CurrencyEnum, Invoice, InvoiceStatusTypeEnum, InvoiceTypeEnum } from '~/generated/graphql'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import { theme } from '~/styles'

gql`
  fragment InvoiceForDetailsTableFooter on Invoice {
    couponTotalAmountCents
    creditNoteTotalAmountCents
    subTotalVatExcludedAmountCents
    subTotalVatIncludedAmountCents
    totalAmountCents
    totalAmountCurrency
    vatAmountCents
    walletTransactionAmountCents
  }
`

interface InvoiceDetailsTableFooterProps {
  invoice: Invoice
  loading: boolean
}

export const InvoiceDetailsTableFooter = memo(
  ({ invoice, loading }: InvoiceDetailsTableFooterProps) => {
    const { translate } = useInternationalization()

    return (
      <tfoot>
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <LoadingTR key={`invoice-details-table-footer-loading-${i}`}>
                <td></td>
                <td>
                  <Skeleton variant="text" height={12} width={160} />
                </td>
                <td>
                  <RightSkeleton variant="text" height={12} width={120} />
                </td>
              </LoadingTR>
            ))}
          </>
        ) : (
          <>
            {invoice.invoiceType !== InvoiceTypeEnum.Credit && (
              <>
                <tr>
                  <td></td>
                  <td>
                    <Typography variant="bodyHl" color="grey600">
                      {translate('text_637ccf8133d2c9a7d11ce6f9')}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="body" color="grey700">
                      {intlFormatNumber(
                        deserializeAmount(
                          invoice?.subTotalVatExcludedAmountCents || 0,
                          invoice?.totalAmountCurrency || CurrencyEnum.Usd
                        ),
                        {
                          currencyDisplay: 'symbol',
                          currency: invoice?.totalAmountCurrency || CurrencyEnum.Usd,
                        }
                      )}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <Typography variant="bodyHl" color="grey600">
                      {translate('text_637ccf8133d2c9a7d11ce6fd')}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="body" color="grey700">
                      {intlFormatNumber(
                        deserializeAmount(
                          invoice?.vatAmountCents || 0,
                          invoice?.totalAmountCurrency || CurrencyEnum.Usd
                        ),
                        {
                          currencyDisplay: 'symbol',
                          currency: invoice?.totalAmountCurrency || CurrencyEnum.Usd,
                        }
                      )}
                    </Typography>
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td>
                    <Typography variant="bodyHl" color="grey600">
                      {translate('text_637ccf8133d2c9a7d11ce701')}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="body" color="grey700">
                      {intlFormatNumber(
                        deserializeAmount(
                          invoice?.subTotalVatIncludedAmountCents || 0,
                          invoice?.totalAmountCurrency || CurrencyEnum.Usd
                        ),
                        {
                          currencyDisplay: 'symbol',
                          currency: invoice?.totalAmountCurrency || CurrencyEnum.Usd,
                        }
                      )}
                    </Typography>
                  </td>
                </tr>
              </>
            )}
            {!!Number(invoice?.creditNoteTotalAmountCents) && (
              <tr>
                <td></td>
                <td>
                  <Typography variant="bodyHl" color="grey600">
                    {translate('text_637ccf8133d2c9a7d11ce708')}
                  </Typography>
                </td>
                <td>
                  <Typography variant="body" color="success600">
                    {intlFormatNumber(
                      deserializeAmount(
                        invoice?.creditNoteTotalAmountCents || 0,
                        invoice?.totalAmountCurrency || CurrencyEnum.Usd
                      ),
                      {
                        currencyDisplay: 'symbol',
                        currency: invoice?.totalAmountCurrency || CurrencyEnum.Usd,
                      }
                    )}
                  </Typography>
                </td>
              </tr>
            )}
            {invoice.status !== InvoiceStatusTypeEnum.Draft && (
              <>
                {!!Number(invoice?.couponTotalAmountCents) && (
                  <tr>
                    <td></td>
                    <td>
                      <Typography variant="bodyHl" color="grey600">
                        {translate('text_637ccf8133d2c9a7d11ce705')}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant="body" color="success600">
                        {intlFormatNumber(
                          deserializeAmount(
                            invoice?.couponTotalAmountCents || 0,
                            invoice?.totalAmountCurrency || CurrencyEnum.Usd
                          ),
                          {
                            currencyDisplay: 'symbol',
                            currency: invoice?.totalAmountCurrency || CurrencyEnum.Usd,
                          }
                        )}
                      </Typography>
                    </td>
                  </tr>
                )}
                {!!Number(invoice?.walletTransactionAmountCents) && (
                  <tr>
                    <td></td>
                    <td>
                      <Typography variant="bodyHl" color="grey600">
                        {translate('text_6391f05df4bf96d81f3660a7')}
                      </Typography>
                    </td>
                    <td>
                      <Typography variant="body" color="success600">
                        {intlFormatNumber(
                          deserializeAmount(
                            invoice?.walletTransactionAmountCents || 0,
                            invoice?.totalAmountCurrency || CurrencyEnum.Usd
                          ),
                          {
                            currencyDisplay: 'symbol',
                            currency: invoice?.totalAmountCurrency || CurrencyEnum.Usd,
                          }
                        )}
                      </Typography>
                    </td>
                  </tr>
                )}
              </>
            )}
            <tr>
              <td></td>
              <td>
                <Typography variant="bodyHl" color="grey700">
                  {invoice.invoiceType === InvoiceTypeEnum.Credit
                    ? translate('text_63887b52e514213fed57fc1c')
                    : translate('text_637ccf8133d2c9a7d11ce70d')}
                </Typography>
              </td>
              <td>
                <Typography variant="body" color="grey700">
                  {intlFormatNumber(
                    deserializeAmount(
                      invoice?.totalAmountCents || 0,
                      invoice?.totalAmountCurrency || CurrencyEnum.Usd
                    ),
                    {
                      currencyDisplay: 'symbol',
                      currency: invoice?.totalAmountCurrency || CurrencyEnum.Usd,
                    }
                  )}
                </Typography>
              </td>
            </tr>
            {invoice.status === InvoiceStatusTypeEnum.Draft && (
              <tr>
                <td></td>
                <td colSpan={2}>
                  <Alert type="info">{translate('text_63b6f4e9b074e3b8beebb97f')}</Alert>
                </td>
              </tr>
            )}
          </>
        )}
      </tfoot>
    )
  }
)

const RightSkeleton = styled(Skeleton)`
  float: right;
`
const LoadingTR = styled.tr`
  > td {
    padding: ${theme.spacing(4)} 0;
  }
`

InvoiceDetailsTableFooter.displayName = 'InvoiceDetailsTableFooter'
