export function handleApiError(error, navigate) {
  const status = error?.response?.status || error?.status;

  if (status === 403) {
    alert("You do not have permission to access this page.");
    navigate("/");
  }
}