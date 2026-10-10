import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useMyEventDetail, useUpdateEvent } from '@/hooks'
import { Button } from '@/components/ui/Button'
import { PageHeader, PageLoadingState, ErrorMessage } from '@/components/common'
import { useToast } from '@/components/ui/Toast'
import EventForm from '@/components/events/EventForm'
import { updateEventSchema, type UpdateEventFormValues } from '@/schemas'
import { ROUTES } from '@/constants'
import { fromInputDateTime, toInputDateTime, getErrorMessage } from '@/utils'

export default function EditEventPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const { data: event, isLoading, isError } = useMyEventDetail(eventId ?? '')
  const updateMutation = useUpdateEvent(eventId ?? '')

  const methods = useForm<UpdateEventFormValues>({
    resolver: zodResolver(updateEventSchema),
    defaultValues: {
      id: '',
      name: '',
      venue: '',
      status: 'DRAFT',
      ticketTypes: [],
    },
  })

  const { handleSubmit, reset, formState: { isSubmitting } } = methods

  useEffect(() => {
    if (!event) return
    reset({
      id: event.id,
      name: event.name,
      venue: event.venue,
      start: toInputDateTime(event.start),
      end: toInputDateTime(event.end),
      salesStart: toInputDateTime(event.salesStart),
      salesEnd: toInputDateTime(event.salesEnd),
      status: event.status,
      ticketTypes: event.ticketTypes.map((tt) => ({
        id: tt.id,
        name: tt.name,
        price: tt.price,
        description: tt.description ?? '',
        totalAvailable: tt.totalAvailable,
      })),
    })
  }, [event, reset])

  async function onSubmit(values: UpdateEventFormValues) {
    if (!eventId) return
    try {
      const payload = {
        ...values,
        start: fromInputDateTime(values.start ?? ''),
        end: fromInputDateTime(values.end ?? ''),
        salesStart: fromInputDateTime(values.salesStart ?? ''),
        salesEnd: fromInputDateTime(values.salesEnd ?? ''),
      }
      const updated = await updateMutation.mutateAsync(payload)
      toast.success('Event updated!', `"${updated.name}" has been saved.`)
      navigate(ROUTES.ORGANIZER_EVENT_DETAIL(eventId))
    } catch (err) {
      toast.error('Update failed', getErrorMessage(err))
    }
  }

  if (isLoading) return <PageLoadingState />
  if (isError || !event) {
    return <ErrorMessage message="Event not found or you don't have permission to edit it." />
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Edit Event"
        subtitle={`Editing "${event.name}"`}
        back={{
          label: 'Back to Event',
          onClick: () => navigate(ROUTES.ORGANIZER_EVENT_DETAIL(eventId ?? '')),
        }}
      />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <EventForm />

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={() => navigate(ROUTES.ORGANIZER_EVENT_DETAIL(eventId ?? ''))}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
