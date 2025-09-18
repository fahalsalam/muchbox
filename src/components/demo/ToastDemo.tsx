"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { showToast, toastMessages, showDemoToast } from "@/lib/toast"

export function ToastDemo() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Toast Notifications Demo</CardTitle>
          <CardDescription>
            Test different types of toast notifications with Sonner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Basic Toast Types */}
            <Button
              variant="default"
              onClick={() => showToast.success('Success!', 'Operation completed successfully.')}
            >
              Success Toast
            </Button>

            <Button
              variant="destructive"
              onClick={() => showToast.error('Error occurred', 'Something went wrong. Please try again.')}
            >
              Error Toast
            </Button>

            <Button
              variant="secondary"
              onClick={() => showToast.info('Information', 'Here is some important information for you.')}
            >
              Info Toast
            </Button>

            <Button
              variant="outline"
              onClick={() => showToast.warning('Warning!', 'Please be careful with this action.')}
            >
              Warning Toast
            </Button>

            {/* Advanced Toast Types */}
            <Button
              variant="outline"
              onClick={() => {
                const loadingToast = showToast.loading('Processing...', 'Please wait while we process your request.')
                
                // Simulate async operation
                setTimeout(() => {
                  showToast.dismiss(loadingToast)
                  showToast.success('Completed!', 'Operation finished successfully.')
                }, 3000)
              }}
            >
              Loading Toast
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const fakePromise = new Promise((resolve, reject) => {
                  setTimeout(() => {
                    Math.random() > 0.5 ? resolve('Success!') : reject('Failed!')
                  }, 2000)
                })

                showToast.promise(fakePromise, {
                  loading: 'Saving data...',
                  success: 'Data saved successfully!',
                  error: 'Failed to save data. Please try again.',
                })
              }}
            >
              Promise Toast
            </Button>

            <Button
              variant="outline"
              onClick={showDemoToast}
            >
              Action Toast
            </Button>

            <Button
              variant="ghost"
              onClick={() => showToast.dismiss()}
            >
              Dismiss All
            </Button>
          </div>

          {/* Application-Specific Toasts */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Application-Specific Toasts</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => toastMessages.orderCreated()}
              >
                Order Created
              </Button>

              <Button
                variant="outline"
                onClick={() => toastMessages.orderProcessed()}
              >
                Order Processed
              </Button>

              <Button
                variant="outline"
                onClick={() => toastMessages.customerCreated()}
              >
                Customer Added
              </Button>

              <Button
                variant="outline"
                onClick={() => toastMessages.loginSuccess()}
              >
                Login Success
              </Button>

              <Button
                variant="outline"
                onClick={() => toastMessages.saveSuccess()}
              >
                Save Success
              </Button>

              <Button
                variant="outline"
                onClick={() => toastMessages.deleteConfirm('this item', () => {
                  showToast.success('Deleted!', 'Item has been permanently removed.')
                })}
              >
                Delete Confirm
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
