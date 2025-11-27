"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { OrderStatuses } from "@/types"
import { useAuth } from "@/lib/contexts/AuthContext"
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

const trackingSchema = z.object({
  currentStatus: z.string().min(1, "Status is required"),
  trackingNotes: z.string().min(10, "Notes must be at least 10 characters"),
  carrier: z.string().min(2, "Carrier is required"),
  expectedDeliveryDate: z.string().min(1, "Expected delivery date is required"),
  location: z.string().optional(),
})

type TrackingFormValues = z.infer<typeof trackingSchema>

interface TrackingFormProps {
  orderStatuses: OrderStatuses[];
  latest: any;
  onSubmit: (data: any) => Promise<void> | void;
}

export default function TrackingForm({ orderStatuses, latest, onSubmit }: TrackingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatuses | null>(null)
  const { user } = useAuth()

  const form = useForm<TrackingFormValues>({
    resolver: zodResolver(trackingSchema),
    defaultValues: {
      currentStatus: latest?.currentStatus || "",
      trackingNotes: "",
      carrier: latest?.carrier || "",
      expectedDeliveryDate: latest?.expectedDeliveryDate?.split("T")[0] || "",
      location: latest?.location || "",
    },
  })

  // Update tracking notes when status changes
  const handleStatusChange = (statusValue: string) => {
    const status = orderStatuses.find(s => s.status === statusValue)
    setSelectedStatus(status || null)
    
    if (status?.description) {
      form.setValue("trackingNotes", status.description)
    }
  }

  const handleSubmit = async (values: TrackingFormValues) => {
    setIsSubmitting(true)
    try {
      const updateData = {
        TrackingID: latest.trackingID,
        OrderId: latest.orderID,
        ProductId: latest.productId,
        StatusId: selectedStatus ? selectedStatus.statusID : undefined,
        updatedBy: user?.name || user?.email || "Merchant",
      };
      
      console.log('Submitting tracking update:', updateData);
      
      await onSubmit(updateData);    
      
      // Reset form after successful submission
      form.reset({
        currentStatus: values.currentStatus,
        trackingNotes: "",
        carrier: values.carrier,
        expectedDeliveryDate: values.expectedDeliveryDate,
        location: values.location,
      })
    } catch (error: any) {
      toast.error(error?.message || "Failed to update tracking")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-full border rounded-lg p-4 bg-muted/30">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          
          <div className="grid grid-cols-1 gap-4">
            
            {/* Current Status */}
            <FormField
              control={form.control}
              name="currentStatus"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Current Status *</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleStatusChange(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orderStatuses && orderStatuses.length > 0 ? (
                        orderStatuses.map((status, index) => (
                          <SelectItem key={`status-${index}`} value={status.status}>
                            {status.status}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No statuses available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expected Delivery Date */}
            <FormField
              control={form.control}
              name="expectedDeliveryDate"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Expected Delivery Date *</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Carrier */}
            <FormField
              control={form.control}
              name="carrier"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Carrier *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., DHL, FedEx, G4S, Standard Delivery" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Name of the shipping carrier
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Nairobi Distribution Center" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Current package location
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Tracking Notes */}
          <FormField
            control={form.control}
            name="trackingNotes"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Tracking Notes *</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder={selectedStatus ? "Auto-filled from status description" : "Enter detailed tracking update (minimum 10 characters)..."}
                    className="resize-none w-full"
                    disabled={!!selectedStatus}
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  {selectedStatus 
                    ? "Tracking notes are auto-populated from the selected status" 
                    : "Provide detailed information about this tracking update"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Reset
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto sm:min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Tracking
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
