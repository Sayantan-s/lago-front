import {
  CreditNoteItemInput,
  CreateCreditNoteInput,
  CreditNoteReasonEnum,
  CurrencyEnum,
} from '~/generated/graphql'
import {
  CreditNoteForm,
  FromFee,
  CreditTypeEnum,
  FeesPerInvoice,
  GroupedFee,
} from '~/components/creditNote/types'
import { serializeAmount } from '~/core/serializers/serializeAmount'

export const serializeCreditNoteInput: (
  invoiceId: string,
  formValues: CreditNoteForm,
  currency: CurrencyEnum
) => CreateCreditNoteInput = (invoiceId, formValues, currency) => {
  const { reason, description, payBack, fees = [], addOnFee } = formValues

  return {
    invoiceId: invoiceId as string,
    reason: reason as CreditNoteReasonEnum,
    description: description,
    creditAmountCents: !payBack
      ? 0
      : serializeAmount(
          payBack.find((p) => p.type === CreditTypeEnum.credit)?.value || 0,
          currency
        ),
    refundAmountCents: !payBack
      ? 0
      : serializeAmount(
          payBack.find((p) => p.type === CreditTypeEnum.refund)?.value || 0,
          currency
        ) || 0,
    items: [
      ...(addOnFee?.value
        ? [
            {
              feeId: addOnFee.id,
              amountCents: serializeAmount(addOnFee.value, currency),
            },
          ]
        : []),
      ...Object.keys(fees).reduce<CreditNoteItemInput[]>((subAcc, subKey) => {
        const subChild = (fees as FeesPerInvoice)[subKey]

        return [
          ...subAcc,
          ...Object.keys(subChild?.fees).reduce<CreditNoteItemInput[]>((groupAcc, groupKey) => {
            const child = subChild?.fees[groupKey] as FromFee

            if (typeof child.checked === 'boolean') {
              return !child.checked
                ? groupAcc
                : [
                    ...groupAcc,
                    {
                      feeId: child?.id,
                      amountCents: serializeAmount(child.value, currency),
                    },
                  ]
            }

            const grouped = (child as unknown as GroupedFee)?.grouped

            return [
              ...groupAcc,
              ...Object.keys(grouped).reduce<CreditNoteItemInput[]>((feeAcc, feeKey) => {
                const fee = grouped[feeKey]

                return !fee.checked
                  ? feeAcc
                  : [
                      ...feeAcc,
                      {
                        feeId: fee.id,
                        amountCents: serializeAmount(fee.value, currency),
                      },
                    ]
              }, []),
            ]
          }, []),
        ]
      }, []),
    ],
  }
}
